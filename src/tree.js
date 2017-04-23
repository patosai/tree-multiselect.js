var Ast = require('./ast');
var Search = require('./search');
var UiBuilder = require('./ui-builder');
var Util = require('./utility');

function Tree(id, $originalSelect, params) {
  this.id = id;
  this.$originalSelect = $originalSelect;

  var uiBuilder = new UiBuilder($originalSelect, params.hideSidePanel);
  this.$selectionContainer = uiBuilder.$selectionContainer;
  this.$selectedContainer = uiBuilder.$selectedContainer;

  this.params = params;

  this.selectOptions = [];

  // data-key is key, provides DOM node
  this.selectNodes = {};
  this.sectionNodes = {};
  this.selectedNodes = {};

  this.selectedKeys = [];
  this.keysToAdd = [];
  this.keysToRemove = [];
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
    var auxiliaryBox = Util.dom.createNode('div', {class: 'auxiliary'});
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
};

Tree.prototype.generateSelections = function(parentNode) {
  var options = this.$originalSelect.find('> option');
  var ast = this.createAst(options);
  this.generateHtml(ast, parentNode);
};

Tree.prototype.createAst = function(options) {
  var data = [];
  var lookup = Ast.createLookup(data);
  //var data = [[], {}];

  var self = this;
  var id = 0;
  var keysToAddAtEnd = [];
  options.each(function() {
    var option = this;
    option.setAttribute('data-key', id);

    var section = option.getAttribute('data-section');

    var optionValue = option.value;
    var optionName = option.text;
    var optionDescription = option.getAttribute('data-description');
    var optionIndex = parseInt(option.getAttribute('data-index'));
    var optionObj = Ast.createItem(id, optionValue, optionName, optionDescription, optionIndex, section);

    if (optionIndex) {
      self.keysToAdd[optionIndex] = id;
    } else if (option.hasAttribute('selected')) {
      keysToAddAtEnd.push(id);
    }
    self.selectOptions[id] = optionObj;

    ++id;

    var lookupPosition = lookup;
    var sectionParts = (section && section.length > 0) ? section.split(self.params.sectionDelimiter) : [];
    for (var ii = 0; ii < sectionParts.length; ++ii) {
      var sectionPart = sectionParts[ii];
      if (lookupPosition.children[sectionPart]) {
        lookupPosition = lookupPosition.children[sectionPart];
      } else {
        var newSection = Ast.createSection(sectionPart);
        lookupPosition.arr.push(newSection);
        var newLookupNode = Ast.createLookup(newSection.items);
        lookupPosition.children[sectionPart] = newLookupNode;
        lookupPosition = newLookupNode;
      }
    }
    lookupPosition.arr.push(optionObj);
  });
  Util.array.removeFalseyExceptZero(this.keysToAdd);
  this.keysToAdd.push(...keysToAddAtEnd);
  Util.array.uniq(this.keysToAdd);
  return data;
};

Tree.prototype.generateHtml = function(astArr, parentNode, sectionIdStart) {
  sectionIdStart = sectionIdStart || 0;
  var numSections = 0;

  for (var ii = 0; ii < astArr.length; ++ii) {
    var obj = astArr[ii];
    if (Ast.isSection(obj)) {
      var title = Ast.getSectionName(obj);
      var id = numSections + sectionIdStart;
      var sectionNode = Util.dom.createSection(title, id, this.params.onlyBatchSelection || this.params.allowBatchSelection, this.params.freeze);
      this.sectionNodes[id] = sectionNode;
      ++numSections;
      parentNode.appendChild(sectionNode);
      numSections += this.generateHtml(Ast.getSectionItems(obj), sectionNode, sectionIdStart + numSections);
    } else if (Ast.isItem(obj)) {
      var selection = Util.dom.createSelection(obj, this.id, !this.params.onlyBatchSelection, this.params.freeze);
      this.selectNodes[obj.id] = selection;
      parentNode.appendChild(selection);
    }
  }

  return numSections;
};

Tree.prototype.popupDescriptionHover = function() {
  this.$selectionContainer.on('mouseenter', 'div.item > span.description', function() {
    var $item = jQuery(this).parent();
    var description = $item.attr('data-description');

    var descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'temp-description-popup';
    descriptionDiv.innerHTML = description;

    descriptionDiv.style.position = 'absolute';

    $item.append(descriptionDiv);
  });

  this.$selectionContainer.on('mouseleave', 'div.item > span.description', function() {
    var $item = jQuery(this).parent();
    $item.find('div.temp-description-popup').remove();
  });
};

Tree.prototype.handleSectionCheckboxMarkings = function() {
  var self = this;
  this.$selectionContainer.on('change', 'input.section[type=checkbox]', function() {
    var $section = jQuery(this).closest('div.section');
    var $items = $section.find('div.item');
    var keys = [];
    $items.each((idx, el) => {
      keys.push(Util.getKey(el));
    });
    if (this.checked) {
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

  // returns array; 0th el is all children are true, 1st el is all children are false
  var returnVal = [true, true];
  var $childCheckboxes = $section.find('> div.item > input[type=checkbox]');
  $childCheckboxes.each(function() {
    if (this.checked) {
      returnVal[1] = false;
    } else {
      returnVal[0] = false;
    }
  });

  var self = this;
  var $childSections = $section.find('> div.section');
  $childSections.each(function() {
    var result = self.redrawSectionCheckboxes(jQuery(this));
    returnVal[0] = returnVal[0] && result[0];
    returnVal[1] = returnVal[1] && result[1];
  });

  var sectionCheckbox = $section.find('> div.title > input[type=checkbox]');
  if (sectionCheckbox.length) {
    sectionCheckbox = sectionCheckbox[0];
    if (returnVal[0]) {
      sectionCheckbox.checked = true;
      sectionCheckbox.indeterminate = false;
    } else if (returnVal[1]) {
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
  var titleSelector = 'div.title';
  var $titleDivs = this.$selectionContainer.find(titleSelector);

  var collapseSpan = Util.dom.createNode('span', {class: 'collapse-section'});
  $titleDivs.prepend(collapseSpan);

  var sectionSelector = 'div.section';
  var $sectionDivs = this.$selectionContainer.find(sectionSelector);

  if (this.params.startCollapsed) {
    $sectionDivs.addClass('collapsed');
  }

  this.$selectionContainer.on('click', titleSelector, function(event) {
    if (event.target.nodeName == 'INPUT') {
      return;
    }

    var $section = jQuery(this).parent();
    $section.toggleClass('collapsed');
    event.stopPropagation();
  });
};

Tree.prototype.createSearchBar = function(parentNode) {
  var searchObj = new Search(this.selectOptions, this.selectNodes, this.sectionNodes, this.params.searchParams);

  var searchNode = Util.dom.createNode('input', {class: 'search', placeholder: 'Search...'});
  parentNode.appendChild(searchNode);

  this.$selectionContainer.on('input', 'input.search', function() {
    var searchText = this.value;
    searchObj.search(searchText);
  });
};

Tree.prototype.createSelectAllButtons = function(parentNode) {
  var selectAllNode = Util.dom.createNode('span', {class: 'select-all', text: this.params.selectAllText});
  var unselectAllNode = Util.dom.createNode('span', {class: 'unselect-all', text: this.params.unselectAllText});

  var selectAllContainer = Util.dom.createNode('div', {class: 'select-all-container'});
  selectAllContainer.appendChild(selectAllNode);
  selectAllContainer.appendChild(unselectAllNode);

  parentNode.appendChild(selectAllContainer);

  var self = this;
  this.$selectionContainer.on('click', 'span.select-all', function() {
    for (var ii = 0; ii < self.selectOptions.length; ++ii) {
      self.keysToAdd.push(ii);
    }
    Util.array.uniq(self.keysToAdd);
    self.render();
  });

  this.$selectionContainer.on('click', 'span.unselect-all', function() {
    self.keysToRemove.push(...self.selectedKeys);
    Util.array.uniq(self.keysToRemove);
    self.render();
  });
};

Tree.prototype.armRemoveSelectedOnClick = function() {
  var self = this;
  this.$selectedContainer.on('click', 'span.remove-selected', function() {
    var parentNode = this.parentNode;
    var key = Util.getKey(parentNode);
    self.keysToRemove.push(key);
    self.render();
  });
};


Tree.prototype.updateSelectedAndOnChange = function() {
  var self = this;
  this.$selectionContainer.on('change', 'input.option[type=checkbox]', function() {
    var checkbox = this;
    var selection = checkbox.parentNode;
    var key = Util.getKey(selection);
    Util.assert(key || key === 0);

    if (checkbox.checked) {
      self.keysToAdd.push(key);
    } else {
      self.keysToRemove.push(key);
    }

    self.render();
  });

  if (this.params.sortable && !this.params.freeze) {
    var startIndex = null;
    var endIndex = null;
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
  Util.array.subtract(this.keysToAdd, this.selectedKeys);
  Util.array.intersect(this.keysToRemove, this.selectedKeys);

  // remove items first
  for (var ii = 0; ii < this.keysToRemove.length; ++ii) {
    // remove the selected divs
    var node = this.selectedNodes[this.keysToRemove[ii]];
    if (node) {
      // slightly more verbose than node.remove(), but more browser support
      node.parentNode.removeChild(node);
      this.selectedNodes[this.keysToRemove[ii]] = null;
    }

    // uncheck these checkboxes
    var selectionNode = this.selectNodes[this.keysToRemove[ii]];
    selectionNode.getElementsByTagName('INPUT')[0].checked = false;
  }

  Util.array.subtract(this.selectedKeys, this.keysToRemove);

  // now add items
  for (var jj = 0; jj < this.keysToAdd.length; ++jj) {
    // create selected divs
    var key = this.keysToAdd[jj];
    var option = this.selectOptions[key];
    this.selectedKeys.push(key);

    var selectedNode = Util.dom.createSelected(option, this.params.freeze, this.params.showSectionOnSelected);
    this.selectedNodes[option.id] = selectedNode;
    this.$selectedContainer.append(selectedNode);

    // check the checkboxes
    (this.selectNodes[this.keysToAdd[jj]]).getElementsByTagName('INPUT')[0].checked = true;
  }

  this.selectedKeys.push(...this.keysToAdd);
  Util.array.uniq(this.selectedKeys);

  // redraw section checkboxes
  this.redrawSectionCheckboxes();

  // now fix original select
  var originalValsHash = {};
  // valHash hashes a value to an index
  var valHash = {};
  for (var kk = 0; kk < this.selectedKeys.length; ++kk) {
    var value = this.selectOptions[this.selectedKeys[kk]].value;
    originalValsHash[this.selectedKeys[kk]] = true;
    valHash[value] = kk;
  }
  // TODO is there a better way to sort the values other than by HTML?
  var options = this.$originalSelect.find('option').toArray();
  options.sort(function(a, b) {
    var aValue = valHash[a.value] || 0;
    var bValue = valHash[b.value] || 0;
    return aValue - bValue;
  });

  this.$originalSelect.html(options);
  this.$originalSelect.find('option').each(function(idx, el) {
    if (originalValsHash[Util.getKey(el)]) {
      this.selected = true;
    } else {
      this.selected = false;
    }
  });
  // NOTE: the following does not work since jQuery duplicates option values with the same value
  //this.$originalSelect.val(vals).change();
  this.$originalSelect.change();

  if (!noCallbacks && this.params.onChange) {
    var optionsSelected = this.selectedKeys.map((key) => {
      return this.selectOptions[key];
    });
    var optionsAdded = this.keysToAdd.map((key) => {
      return this.selectOptions[key];
    });
    var optionsRemoved = this.keysToRemove.map((key) => {
      return this.selectOptions[key];
    });
    this.params.onChange(optionsSelected, optionsAdded, optionsRemoved);
  }

  this.keysToRemove = [];
  this.keysToAdd = [];
};

module.exports = Tree;
