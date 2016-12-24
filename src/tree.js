var Option = require('./option');
var Search = require('./search');
var UiBuilder = require('./ui-builder');
var Util = require('./utility');

function Tree(id, $originalSelect, options) {
  this.id = id;
  this.$originalSelect = $originalSelect;

  var uiBuilder = new UiBuilder($originalSelect, options.hideSidePanel);
  this.$selectionContainer = uiBuilder.$selectionContainer;
  this.$selectedContainer = uiBuilder.$selectedContainer;

  this.options = options;

  this.selectOptions = [];
  this.selectNodes = {}; // data-key is key, provides DOM node
  this.selectedNodes = {}; // data-key is key, provides DOM node for selected
  this.selectedKeys = [];
  this.keysToAdd = [];
  this.keysToRemove = [];
}

Tree.prototype.initialize = function() {
  var data = this.generateSelections();
  this.generateHtmlFromData(data, this.$selectionContainer[0]);

  this.popupDescriptionHover();

  if (this.options.allowBatchSelection) {
    this.handleSectionCheckboxMarkings();
  }

  if (this.options.collapsible) {
    this.addCollapsibility();
  }

  if (this.options.searchable) {
    this.createSearchBar();
  }

  if (this.options.enableSelectAll) {
    this.createSelectAllButtons();
  }

  this.armRemoveSelectedOnClick();
  this.updateSelectedAndOnChange();

  this.render(true);
};

Tree.prototype.generateSelections = function() {
  // nested objects and arrays
  // [ [options directly under this section], {nested sections}]
  var data = [[], {}];

  var sectionDelimiter = this.options.sectionDelimiter;

  var self = this;
  var id = 0;
  var keysToAddAtEnd = [];
  this.$originalSelect.find('> option').each(function() {
    var option = this;
    option.setAttribute('data-key', id);

    var section = option.getAttribute('data-section');
    var path = (section && section.length > 0) ? section.split(sectionDelimiter) : [];

    var optionValue = option.value;
    var optionName = option.text;
    var optionDescription = option.getAttribute('data-description');
    var optionIndex = parseInt(option.getAttribute('data-index'));
    var optionObj = new Option(id, optionValue, optionName, optionDescription, optionIndex, section);
    if (optionIndex) {
      self.keysToAdd[optionIndex] = id;
    } else if (option.hasAttribute('selected')) {
      keysToAddAtEnd.push(id);
    }
    self.selectOptions[id] = optionObj;

    var currentPosition = data;
    for (var ii = 0; ii < path.length; ++ii) {
      if (!currentPosition[1][path[ii]]) {
        currentPosition[1][path[ii]] = [[], {}];
      }
      currentPosition = currentPosition[1][path[ii]];
    }
    currentPosition[0].push(optionObj);

    ++id;
  });
  this.keysToAdd = Util.array.uniq(Util.array.removeFalseyExceptZero(this.keysToAdd).concat(keysToAddAtEnd));

  return data;
};

Tree.prototype.generateHtmlFromData = function(data, parentNode) {
  for (var ii = 0; ii < data[0].length; ++ii) {
    var option = data[0][ii];
    var selection = Util.dom.createSelection(option, this.id, !this.options.onlyBatchSelection, this.options.freeze);
    this.selectNodes[option.id] = selection;
    parentNode.appendChild(selection);
  }

  var keys = Object.keys(data[1]);
  for (var jj = 0; jj < keys.length; ++jj) {
    var title = keys[jj];
    var sectionNode = Util.dom.createSection(title, this.options.onlyBatchSelection || this.options.allowBatchSelection, this.options.freeze);
    parentNode.appendChild(sectionNode);
    this.generateHtmlFromData(data[1][keys[jj]], sectionNode);
  }
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
      self.keysToAdd = Util.array.uniq(self.keysToAdd.concat(keys));
    } else {
      self.keysToRemove = Util.array.uniq(self.keysToRemove.concat(keys));
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
  var hideIndicator = '-';
  var expandIndicator = '+';

  var titleSelector = 'div.title';
  var $titleDivs = this.$selectionContainer.find(titleSelector);

  var collapseSpan = Util.dom.createNode('span', {class: 'collapse-section'});
  if (this.options.startCollapsed) {
    jQuery(collapseSpan).text(expandIndicator);
    $titleDivs.siblings().toggle();
  } else {
    jQuery(collapseSpan).text(hideIndicator);
  }
  $titleDivs.prepend(collapseSpan);

  this.$selectionContainer.on('click', titleSelector, function(event) {
    if (event.target.nodeName == 'INPUT') {
      return;
    }

    var $collapseSection = jQuery(this).find('> span.collapse-section');
    var indicator = $collapseSection.text();
    $collapseSection.text(indicator ==  hideIndicator ? expandIndicator : hideIndicator);
    var $title = $collapseSection.parent();
    $title.siblings().toggle();
  });
};

Tree.prototype.createSearchBar = function() {
  Search.buildIndex(this.selectOptions, this.selectNodes);

  var searchNode = Util.dom.createNode('input', {class: 'search', placeholder: 'Search...'});
  this.$selectionContainer.prepend(searchNode);

  this.$selectionContainer.on('input', 'input.search', function() {
    var searchText = this.value;
    Search.search(searchText);
  });
};

Tree.prototype.createSelectAllButtons = function() {
  var selectAllNode = Util.dom.createNode('span', {class: 'select-all', text: this.options.selectAllText});
  var unselectAllNode = Util.dom.createNode('span', {class: 'unselect-all', text: this.options.unselectAllText});

  var selectAllContainer = Util.dom.createNode('div', {class: 'select-all-container'});
  selectAllContainer.appendChild(selectAllNode);
  selectAllContainer.appendChild(unselectAllNode);

  this.$selectionContainer.prepend(selectAllContainer);

  var self = this;
  this.$selectionContainer.on('click', 'span.select-all', function() {
    for (var ii = 0; ii < self.selectOptions.length; ++ii) {
      self.keysToAdd.push(ii);
    }
    self.keysToAdd = Util.array.uniq(self.keysToAdd);
    self.render();
  });

  this.$selectionContainer.on('click', 'span.unselect-all', function() {
    self.keysToRemove = Util.array.uniq(self.keysToRemove.concat(self.selectedKeys));
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

  if (this.options.sortable && !this.options.freeze) {
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
  this.keysToAdd = Util.array.subtract(this.keysToAdd, this.selectedKeys);
  this.keysToRemove = Util.array.intersect(this.keysToRemove, this.selectedKeys);

  // remove items first
  for (var ii = 0; ii < this.keysToRemove.length; ++ii) {
    // remove the selected divs
    var node = this.selectedNodes[this.keysToRemove[ii]];
    if (node) {
      node.remove();
      this.selectedNodes[this.keysToRemove[ii]] = null;
    }

    // uncheck these checkboxes
    var selectionNode = this.selectNodes[this.keysToRemove[ii]];
    selectionNode.getElementsByTagName('INPUT')[0].checked = false;
  }

  this.selectedKeys = Util.array.subtract(this.selectedKeys, this.keysToRemove);

  // now add items
  for (var jj = 0; jj < this.keysToAdd.length; ++jj) {
    // create selected divs
    var key = this.keysToAdd[jj];
    var option = this.selectOptions[key];
    this.selectedKeys.push(key);

    var selectedNode = Util.dom.createSelected(option, this.options.freeze, this.options.showSectionOnSelected);
    this.selectedNodes[option.id] = selectedNode;
    this.$selectedContainer.append(selectedNode);

    // check the checkboxes
    (this.selectNodes[this.keysToAdd[jj]]).getElementsByTagName('INPUT')[0].checked = true;
  }

  this.selectedKeys = Util.array.uniq(this.selectedKeys.concat(this.keysToAdd));

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

  if (!noCallbacks && this.options.onChange) {
    var optionsSelected = this.selectedKeys.map((key) => {
      return this.selectOptions[key];
    });
    var optionsAdded = this.keysToAdd.map((key) => {
      return this.selectOptions[key];
    });
    var optionsRemoved = this.keysToRemove.map((key) => {
      return this.selectOptions[key];
    });
    this.options.onChange(optionsSelected, optionsAdded, optionsRemoved);
  }

  this.keysToRemove = [];
  this.keysToAdd = [];
};

module.exports = Tree;
