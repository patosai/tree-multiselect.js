let Ast = require('./ast');
let Search = require('./search');
let UiBuilder = require('./ui-builder');
let Util = require('./utility');

function Tree(id, $originalSelect, params) {
  this.id = id;
  this.$originalSelect = $originalSelect;

  this.params = params;

  this.resetState();
}

Tree.prototype.initialize = function() {
  this.generateSelections(this.$selectionContainer[0]);

  this.popupDescriptionHover();

  if (this.params.allowBatchSelection) {
    this.handleSectionCheckboxMarkings();
  }

  if (this.params.collapsible) {
    this.addCollapsibility();
  }

  if (this.params.searchable || this.params.enableSelectAll) {
    let auxiliaryBox = Util.dom.createNode('div', {class: 'auxiliary'});
    this.$selectionContainer.prepend(auxiliaryBox, this.$selectionContainer.firstChild);

    if (this.params.searchable) {
      this.createSearchBar(auxiliaryBox);
    }

    if (this.params.enableSelectAll) {
      this.createSelectAllButtons(auxiliaryBox);
    }
  }

  this.armRemoveSelectedOnClick();
  this.updateSelectedAndOnChange();

  this.render(true);
  this.uiBuilder.attach();
};

Tree.prototype.remove = function() {
  this.uiBuilder.remove();
  this.resetState();
};

Tree.prototype.reload = function() {
  this.remove();
  this.initialize();
};

Tree.prototype.resetState = function() {
  this.uiBuilder = new UiBuilder(this.$originalSelect, this.params.hideSidePanel);
  this.$treeContainer = this.uiBuilder.$treeContainer;
  this.$selectionContainer = this.uiBuilder.$selectionContainer;
  this.$selectedContainer = this.uiBuilder.$selectedContainer;

  // data-key is key, provides DOM node
  this.astItems = {};
  this.astSections = {};
  this.selectedNodes = {};

  this.selectedKeys = [];
  this.keysToAdd = [];
  this.keysToRemove = [];
};

Tree.prototype.generateSelections = function(parentNode) {
  let options = this.$originalSelect.children('option');
  let ast = this.createAst(options);
  this.generateHtml(ast, parentNode);
};

Tree.prototype.createAst = function(options) {
  let data = [];
  let lookup = Ast.createLookup(data);

  let self = this;
  let itemId = 0;
  let sectionId = 0;

  let initialIndexItems = [];
  let keysToAddAtEnd = [];
  options.each(function() {
    let option = this;
    option.setAttribute('data-key', itemId);

    let item = Ast.createItem({
      treeId: self.id,
      id: itemId,
      value: option.value,
      text: option.text,
      description: option.getAttribute('data-description'),
      initialIndex: option.getAttribute('data-index'),
      section: option.getAttribute('data-section'),
      disabled: option.hasAttribute('readonly'),
      selected: option.hasAttribute('selected')
    });

    if (item.initialIndex) {
      initialIndexItems[item.initialIndex] = initialIndexItems[item.initialIndex] || [];
      initialIndexItems[item.initialIndex].push(itemId);
    } else if (item.selected) {
      keysToAddAtEnd.push(itemId);
    }
    self.astItems[itemId] = item;

    ++itemId;

    let lookupPosition = lookup;
    let section = item.section;
    let sectionParts = (section && section.length > 0) ? section.split(self.params.sectionDelimiter) : [];
    for (let ii = 0; ii < sectionParts.length; ++ii) {
      let sectionPart = sectionParts[ii];
      if (lookupPosition.children[sectionPart]) {
        lookupPosition = lookupPosition.children[sectionPart];
      } else {
        let newSection = Ast.createSection({
          treeId: self.id,
          id: sectionId,
          name: sectionPart
        });
        ++sectionId;

        lookupPosition.arr.push(newSection);
        let newLookupNode = Ast.createLookup(newSection.items);
        lookupPosition.children[sectionPart] = newLookupNode;
        lookupPosition = newLookupNode;
      }
    }
    lookupPosition.arr.push(item);
  });
  this.keysToAdd = Util.array.flatten(initialIndexItems);
  Util.array.removeFalseyExceptZero(this.keysToAdd);
  this.keysToAdd.push(...keysToAddAtEnd);
  Util.array.uniq(this.keysToAdd);
  return data;
};

Tree.prototype.generateHtml = function(astArr, parentNode) {
  for (let ii = 0; ii < astArr.length; ++ii) {
    const astObj = astArr[ii];
    if (astObj.isSection()) {
      this.astSections[astObj.id] = astObj;

      let createCheckboxes = this.params.allowBatchSelection;
      let disableCheckboxes = this.params.freeze;
      let node = astObj.render(createCheckboxes, disableCheckboxes);
      parentNode.appendChild(node);
      this.generateHtml(astObj.items, node);
    } else if (astObj.isItem()) {
      this.astItems[astObj.id] = astObj;

      let createCheckboxes = !this.params.onlyBatchSelection;
      let disableCheckboxes = this.params.freeze;
      let node = astObj.render(createCheckboxes, disableCheckboxes);
      parentNode.appendChild(node);
    }
  }
};

Tree.prototype.popupDescriptionHover = function() {
  this.$selectionContainer.on('mouseenter', 'div.item > span.description', function() {
    let $item = jQuery(this).parent();
    let description = $item.attr('data-description');

    let descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'temp-description-popup';
    descriptionDiv.innerHTML = description;

    descriptionDiv.style.position = 'absolute';

    $item.append(descriptionDiv);
  });

  this.$selectionContainer.on('mouseleave', 'div.item > span.description', function() {
    let $item = jQuery(this).parent();
    $item.find('div.temp-description-popup').remove();
  });
};

Tree.prototype.handleSectionCheckboxMarkings = function() {
  let self = this;
  this.$selectionContainer.on('click', 'input.section[type=checkbox]', function() {
    let $section = jQuery(this).closest('div.section');
    let $items = $section.find('div.item');
    let keys = $items.map((idx, el) => {
      let key = Util.getKey(el);
      let astItem = self.astItems[key];
      if (!astItem.disabled) {
        return key;
      }
    }).get();

    if (this.checked) {
      // TODO why does this always take this branch
      self.keysToAdd.push(...keys);
      Util.array.uniq(self.keysToAdd);
    } else {
      self.keysToRemove.push(...keys);
      Util.array.uniq(self.keysToRemove);
    }
    self.render();
  });
};

Tree.prototype.redrawSectionCheckboxes = function($section) {
  $section = $section || this.$selectionContainer;

  // returns array; bit 1 is all children are true, bit 0 is all children are false
  let returnVal = 0b11;

  let self = this;
  let $childSections = $section.find('> div.section');
  $childSections.each(function() {
    let result = self.redrawSectionCheckboxes(jQuery(this));
    returnVal &= result;
  });

  if (returnVal) {
    let $childCheckboxes = $section.find('> div.item > input[type=checkbox]');
    for (let ii = 0; ii < $childCheckboxes.length; ++ii) {
      if ($childCheckboxes[ii].disabled) {
        // do nothing
      } else if ($childCheckboxes[ii].checked) {
        returnVal &= ~0b10;
      } else {
        returnVal &= ~0b01;
      }

      if (returnVal === 0) {
        break;
      }
    }
  }

  let sectionCheckbox = $section.find('> div.title > input[type=checkbox]');
  if (sectionCheckbox.length) {
    sectionCheckbox = sectionCheckbox[0];
    if (returnVal & 0b01) {
      sectionCheckbox.checked = true;
      sectionCheckbox.indeterminate = false;
    } else if (returnVal & 0b10) {
      sectionCheckbox.checked = false;
      sectionCheckbox.indeterminate = false;
    } else {
      sectionCheckbox.checked = false;
      sectionCheckbox.indeterminate = true;
    }
  }

  return returnVal;
};

Tree.prototype.addCollapsibility = function() {
  let titleSelector = 'div.title';
  let $titleDivs = this.$selectionContainer.find(titleSelector);

  let collapseSpan = Util.dom.createNode('span', {class: 'collapse-section'});
  $titleDivs.prepend(collapseSpan);

  let sectionSelector = 'div.section';
  let $sectionDivs = this.$selectionContainer.find(sectionSelector);

  if (this.params.startCollapsed) {
    $sectionDivs.addClass('collapsed');
  }

  this.$selectionContainer.on('click', titleSelector, function(event) {
    if (event.target.nodeName === 'INPUT') {
      return;
    }

    let $section = jQuery(this).parent();
    $section.toggleClass('collapsed');
    event.stopPropagation();
  });
};

Tree.prototype.createSearchBar = function(parentNode) {
  let searchObj = new Search(this.astItems, this.astSections, this.params.searchParams);

  let searchNode = Util.dom.createNode('input', {class: 'search', placeholder: 'Search...'});
  parentNode.appendChild(searchNode);

  this.$selectionContainer.on('input', 'input.search', function() {
    let searchText = this.value;
    searchObj.search(searchText);
  });
};

Tree.prototype.createSelectAllButtons = function(parentNode) {
  let selectAllNode = Util.dom.createNode('span', {class: 'select-all', text: this.params.selectAllText});
  let unselectAllNode = Util.dom.createNode('span', {class: 'unselect-all', text: this.params.unselectAllText});

  let selectAllContainer = Util.dom.createNode('div', {class: 'select-all-container'});
  selectAllContainer.appendChild(selectAllNode);
  selectAllContainer.appendChild(unselectAllNode);

  parentNode.appendChild(selectAllContainer);

  let self = this;
  this.$selectionContainer.on('click', 'span.select-all', function() {
    self.keysToAdd = Object.keys(self.astItems);
    self.render();
  });

  this.$selectionContainer.on('click', 'span.unselect-all', function() {
    self.keysToRemove.push(...self.selectedKeys);
    self.render();
  });
};

Tree.prototype.armRemoveSelectedOnClick = function() {
  let self = this;
  this.$selectedContainer.on('click', 'span.remove-selected', function() {
    let parentNode = this.parentNode;
    let key = Util.getKey(parentNode);
    self.keysToRemove.push(key);
    self.render();
  });
};


Tree.prototype.updateSelectedAndOnChange = function() {
  let self = this;
  this.$selectionContainer.on('click', 'input.option[type=checkbox]', function() {
    let checkbox = this;
    let selection = checkbox.parentNode;
    let key = Util.getKey(selection);
    Util.assert(key || key === 0);

    if (checkbox.checked) {
      self.keysToAdd.push(key);
    } else {
      self.keysToRemove.push(key);
    }

    self.render();
  });

  if (this.params.sortable && !this.params.freeze) {
    let startIndex = null;
    let endIndex = null;
    this.$selectedContainer.sortable({
      start: function(event, ui) {
        startIndex = ui.item.index();
      },

      stop: function(event, ui) {
        endIndex = ui.item.index();
        if (startIndex === endIndex) {
          return;
        }
        Util.array.moveEl(self.selectedKeys, startIndex, endIndex);
        self.render();
      }
    });
  }
};

Tree.prototype.render = function(noCallbacks) {
  // fix arrays first
  Util.array.uniq(this.keysToAdd);
  Util.array.uniq(this.keysToRemove);

  Util.array.subtract(this.keysToAdd, this.selectedKeys);
  Util.array.intersect(this.keysToRemove, this.selectedKeys);

  // remove items first
  for (let ii = 0; ii < this.keysToRemove.length; ++ii) {
    // remove the selected divs
    let node = this.selectedNodes[this.keysToRemove[ii]];
    if (node) {
      // slightly more verbose than node.remove(), but more browser support
      node.parentNode.removeChild(node);
      this.selectedNodes[this.keysToRemove[ii]] = null;
    }

    // uncheck these checkboxes
    let selectionNode = this.astItems[this.keysToRemove[ii]].node;
    selectionNode.getElementsByTagName('INPUT')[0].checked = false;
  }

  Util.array.subtract(this.selectedKeys, this.keysToRemove);

  // now add items
  for (let jj = 0; jj < this.keysToAdd.length; ++jj) {
    // create selected divs
    let key = this.keysToAdd[jj];
    let astItem = this.astItems[key];
    this.selectedKeys.push(key);

    let selectedNode = Util.dom.createSelected(astItem, this.params.freeze, this.params.showSectionOnSelected);
    this.selectedNodes[astItem.id] = selectedNode;
    this.$selectedContainer.append(selectedNode);

    // check the checkboxes
    let inputNode = astItem.node.getElementsByTagName('INPUT')[0];
    if (inputNode) {
      inputNode.checked = true;
    }
  }

  this.selectedKeys.push(...this.keysToAdd);
  Util.array.uniq(this.selectedKeys);

  // redraw section checkboxes
  this.redrawSectionCheckboxes();

  // now fix original select
  let originalValsHash = {};
  // valHash hashes a value to an index
  let valHash = {};
  for (let kk = 0; kk < this.selectedKeys.length; ++kk) {
    let value = this.astItems[this.selectedKeys[kk]].value;
    originalValsHash[this.selectedKeys[kk]] = true;
    valHash[value] = kk;
  }
  // TODO is there a better way to sort the values other than by HTML?
  let options = this.$originalSelect.find('option').toArray();
  options.sort(function(a, b) {
    let aValue = valHash[a.value] || 0;
    let bValue = valHash[b.value] || 0;
    return aValue - bValue;
  });

  this.$originalSelect.html(options);
  this.$originalSelect.find('option').each(function(idx, el) {
    this.selected = !!originalValsHash[Util.getKey(el)];
  });
  // NOTE: the following does not work since jQuery duplicates option values with the same value
  //this.$originalSelect.val(vals).change();
  this.$originalSelect.change();

  if (!noCallbacks && this.params.onChange) {
    let optionsSelected = this.selectedKeys.map((key) => {
      return this.astItems[key];
    });
    let optionsAdded = this.keysToAdd.map((key) => {
      return this.astItems[key];
    });
    let optionsRemoved = this.keysToRemove.map((key) => {
      return this.astItems[key];
    });
    this.params.onChange(optionsSelected, optionsAdded, optionsRemoved);
  }

  this.keysToRemove = [];
  this.keysToAdd = [];
};

module.exports = Tree;
