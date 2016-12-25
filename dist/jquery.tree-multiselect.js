/* jQuery Tree Multiselect v2.1.1 | (c) Patrick Tsai | MIT Licensed */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Tree = require('./tree');

var uniqueId = 0;

var treeMultiselect = function treeMultiselect(opts) {
  var _this = this;

  var options = mergeDefaultOptions(opts);

  this.each(function () {
    var $originalSelect = jQuery(_this);
    $originalSelect.attr('multiple', '').css('display', 'none');

    var tree = new Tree(uniqueId, $originalSelect, options);
    tree.initialize();

    ++uniqueId;
  });

  return this;
};

function mergeDefaultOptions(options) {
  var defaults = {
    allowBatchSelection: true,
    collapsible: true,
    enableSelectAll: false,
    selectAllText: 'Select All',
    unselectAllText: 'Unselect All',
    freeze: false,
    hideSidePanel: false,
    onChange: null,
    onlyBatchSelection: false,
    searchable: false,
    sectionDelimiter: '/',
    showSectionOnSelected: true,
    sortable: false,
    startCollapsed: false
  };
  return jQuery.extend({}, defaults, options);
}

module.exports = treeMultiselect;

},{"./tree":5}],2:[function(require,module,exports){
"use strict";

module.exports = function (id, value, text, description, initialIndex, section) {
  this.id = id;
  this.value = value;
  this.text = text;
  this.description = description;
  this.initialIndex = initialIndex;
  this.section = section;
};

},{}],3:[function(require,module,exports){
'use strict';

var Util = require('./utility');

var MAX_SAMPLE_SIZE = 3;

function Search(options, inSelectionNodeHash, inSectionNodeHash) {
  this.options = options;

  this.index = {}; // key: at most three-letter combinations, value: array of data-key

  // key: data-key, value: DOM node
  this.selectionNodeHash = inSelectionNodeHash;
  this.selectionNodeHashKeys = Object.keys(inSelectionNodeHash);

  this.sectionNodeHash = inSectionNodeHash;
  this.sectionNodeHashKeys = Object.keys(inSectionNodeHash);

  this.buildIndex();
}

Search.prototype.buildIndex = function () {
  var _this = this;

  // options are sorted by id already
  // trigrams
  this.options.forEach(function (option) {
    var searchWords = Util.array.removeFalseyExceptZero([option.value, option.text, option.description, option.section]).map(function (item) {
      return item.toLowerCase();
    });

    searchWords.forEach(function (searchWord) {
      var words = searchWord.split(' ');
      words.forEach(function (word) {
        _this._addToIndex(word, option.id);
      });
    });
  });
};

Search.prototype._addToIndex = function (key, id) {
  for (var sample_size = 1; sample_size <= MAX_SAMPLE_SIZE; ++sample_size) {
    for (var start_offset = 0; start_offset < key.length - sample_size + 1; ++start_offset) {
      var minikey = key.substring(start_offset, start_offset + sample_size);

      if (!this.index[minikey]) {
        this.index[minikey] = [];
      }

      // don't duplicate
      // this takes advantage of the fact that the minikeys with same id's are added sequentially
      var length = this.index[minikey].length;
      if (length === 0 || this.index[minikey][length - 1] !== id) {
        this.index[minikey].push(id);
      }
    }
  }
};

Search.prototype.search = function (value) {
  var _this2 = this;

  if (!value) {
    this.selectionNodeHashKeys.forEach(function (id) {
      _this2.selectionNodeHash[id].style.display = '';
    });
    this.sectionNodeHashKeys.forEach(function (id) {
      _this2.sectionNodeHash[id].style.display = '';
    });
    return;
  }

  value = value.toLowerCase();

  var searchWords = value.split(' ');
  var searchChunks = [];
  searchWords.forEach(function (searchWord) {
    var chunks = splitWord(searchWord);
    chunks.forEach(function (chunk) {
      searchChunks.push(_this2.index[chunk] || []);
    });
  });

  var matchedNodeIds = Util.array.intersectMany(searchChunks);

  // now we have id's that match search query
  this._handleNodeVisbilities(matchedNodeIds);
};

Search.prototype._handleNodeVisbilities = function (shownNodeIds) {
  var _this3 = this;

  var shownNodeIdsHash = {};
  var sectionsToNotHideHash = {};
  shownNodeIds.forEach(function (id) {
    shownNodeIdsHash[id] = true;
    var node = _this3.selectionNodeHash[id];
    node.style.display = '';

    // now search for parent sections
    node = node.parentNode;
    while (!node.className.match(/tree-multiselect/)) {
      if (node.className.match(/section/)) {
        var key = Util.getKey(node);
        Util.assert(key || key === 0);
        if (sectionsToNotHideHash[key]) {
          break;
        } else {
          sectionsToNotHideHash[key] = true;
          node.style.display = '';
        }
      }
      node = node.parentNode;
    }
  });

  // hide selections
  this.selectionNodeHashKeys.forEach(function (id) {
    if (!shownNodeIdsHash[id]) {
      _this3.selectionNodeHash[id].style.display = 'none';
    }
  });
  this.sectionNodeHashKeys.forEach(function (id) {
    if (!sectionsToNotHideHash[id]) {
      _this3.sectionNodeHash[id].style.display = 'none';
    }
  });
};

// split word into three letter (or less) pieces
function splitWord(word) {
  Util.assert(word);

  if (word.length < MAX_SAMPLE_SIZE) {
    return [word];
  }

  var chunks = [];
  for (var ii = 0; ii < word.length - MAX_SAMPLE_SIZE + 1; ++ii) {
    chunks.push(word.substring(ii, ii + MAX_SAMPLE_SIZE));
  }
  return chunks;
}

module.exports = Search;

},{"./utility":9}],4:[function(require,module,exports){
'use strict';

(function ($) {
  'use strict';

  $.fn.treeMultiselect = require('./main');
})(jQuery);

},{"./main":1}],5:[function(require,module,exports){
'use strict';

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

  // data-key is key, provides DOM node
  this.selectNodes = {};
  this.sectionNodes = {};
  this.selectedNodes = {};

  this.selectedKeys = [];
  this.keysToAdd = [];
  this.keysToRemove = [];
}

Tree.prototype.initialize = function () {
  var data = this.generateSelections();
  this.generateHtmlFromData(data, this.$selectionContainer[0]);

  this.popupDescriptionHover();

  if (this.options.allowBatchSelection) {
    this.handleSectionCheckboxMarkings();
  }

  if (this.options.collapsible) {
    this.addCollapsibility();
  }

  if (this.options.searchable || this.options.enableSelectAll) {
    var auxiliaryBox = Util.dom.createNode('div', { class: 'auxiliary' });
    this.$selectionContainer.prepend(auxiliaryBox, this.$selectionContainer.firstChild);

    if (this.options.searchable) {
      this.createSearchBar(auxiliaryBox);
    }

    if (this.options.enableSelectAll) {
      this.createSelectAllButtons(auxiliaryBox);
    }
  }

  this.armRemoveSelectedOnClick();
  this.updateSelectedAndOnChange();

  this.render(true);
};

Tree.prototype.generateSelections = function () {
  // nested objects and arrays
  // [ [options directly under this section], {nested sections}]
  var data = [[], {}];

  var sectionDelimiter = this.options.sectionDelimiter;

  var self = this;
  var id = 0;
  var keysToAddAtEnd = [];
  this.$originalSelect.find('> option').each(function () {
    var option = this;
    option.setAttribute('data-key', id);

    var section = option.getAttribute('data-section');
    var path = section && section.length > 0 ? section.split(sectionDelimiter) : [];

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

Tree.prototype.generateHtmlFromData = function (data, parentNode, sectionIdStart) {
  sectionIdStart = sectionIdStart || 0;
  var numItems = 0;

  for (var ii = 0; ii < data[0].length; ++ii) {
    var option = data[0][ii];
    var selection = Util.dom.createSelection(option, this.id, !this.options.onlyBatchSelection, this.options.freeze);
    this.selectNodes[option.id] = selection;
    parentNode.appendChild(selection);
  }

  var keys = Object.keys(data[1]);
  for (var jj = 0; jj < keys.length; ++jj) {
    var title = keys[jj];
    var id = numItems + sectionIdStart;
    var sectionNode = Util.dom.createSection(title, id, this.options.onlyBatchSelection || this.options.allowBatchSelection, this.options.freeze);
    this.sectionNodes[id] = sectionNode;
    ++numItems;
    parentNode.appendChild(sectionNode);
    numItems += this.generateHtmlFromData(data[1][keys[jj]], sectionNode, sectionIdStart + numItems);
  }

  return numItems;
};

Tree.prototype.popupDescriptionHover = function () {
  this.$selectionContainer.on('mouseenter', 'div.item > span.description', function () {
    var $item = jQuery(this).parent();
    var description = $item.attr('data-description');

    var descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'temp-description-popup';
    descriptionDiv.innerHTML = description;

    descriptionDiv.style.position = 'absolute';

    $item.append(descriptionDiv);
  });

  this.$selectionContainer.on('mouseleave', 'div.item > span.description', function () {
    var $item = jQuery(this).parent();
    $item.find('div.temp-description-popup').remove();
  });
};

Tree.prototype.handleSectionCheckboxMarkings = function () {
  var self = this;
  this.$selectionContainer.on('change', 'input.section[type=checkbox]', function () {
    var $section = jQuery(this).closest('div.section');
    var $items = $section.find('div.item');
    var keys = [];
    $items.each(function (idx, el) {
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

Tree.prototype.redrawSectionCheckboxes = function ($section) {
  $section = $section || this.$selectionContainer;

  // returns array; 0th el is all children are true, 1st el is all children are false
  var returnVal = [true, true];
  var $childCheckboxes = $section.find('> div.item > input[type=checkbox]');
  $childCheckboxes.each(function () {
    if (this.checked) {
      returnVal[1] = false;
    } else {
      returnVal[0] = false;
    }
  });

  var self = this;
  var $childSections = $section.find('> div.section');
  $childSections.each(function () {
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

Tree.prototype.addCollapsibility = function () {
  var hideIndicator = '-';
  var expandIndicator = '+';

  var titleSelector = 'div.title';
  var $titleDivs = this.$selectionContainer.find(titleSelector);

  var collapseSpan = Util.dom.createNode('span', { class: 'collapse-section' });
  if (this.options.startCollapsed) {
    jQuery(collapseSpan).text(expandIndicator);
    $titleDivs.siblings().toggle();
  } else {
    jQuery(collapseSpan).text(hideIndicator);
  }
  $titleDivs.prepend(collapseSpan);

  this.$selectionContainer.on('click', titleSelector, function (event) {
    if (event.target.nodeName == 'INPUT') {
      return;
    }

    var $collapseSection = jQuery(this).find('> span.collapse-section');
    var indicator = $collapseSection.text();
    $collapseSection.text(indicator == hideIndicator ? expandIndicator : hideIndicator);
    var $title = $collapseSection.parent();
    $title.siblings().toggle();
  });
};

Tree.prototype.createSearchBar = function (parentNode) {
  var searchObj = new Search(this.selectOptions, this.selectNodes, this.sectionNodes);

  var searchNode = Util.dom.createNode('input', { class: 'search', placeholder: 'Search...' });
  parentNode.appendChild(searchNode);

  this.$selectionContainer.on('input', 'input.search', function () {
    var searchText = this.value;
    searchObj.search(searchText);
  });
};

Tree.prototype.createSelectAllButtons = function (parentNode) {
  var selectAllNode = Util.dom.createNode('span', { class: 'select-all', text: this.options.selectAllText });
  var unselectAllNode = Util.dom.createNode('span', { class: 'unselect-all', text: this.options.unselectAllText });

  var selectAllContainer = Util.dom.createNode('div', { class: 'select-all-container' });
  selectAllContainer.appendChild(selectAllNode);
  selectAllContainer.appendChild(unselectAllNode);

  parentNode.appendChild(selectAllContainer);

  var self = this;
  this.$selectionContainer.on('click', 'span.select-all', function () {
    for (var ii = 0; ii < self.selectOptions.length; ++ii) {
      self.keysToAdd.push(ii);
    }
    self.keysToAdd = Util.array.uniq(self.keysToAdd);
    self.render();
  });

  this.$selectionContainer.on('click', 'span.unselect-all', function () {
    self.keysToRemove = Util.array.uniq(self.keysToRemove.concat(self.selectedKeys));
    self.render();
  });
};

Tree.prototype.armRemoveSelectedOnClick = function () {
  var self = this;
  this.$selectedContainer.on('click', 'span.remove-selected', function () {
    var parentNode = this.parentNode;
    var key = Util.getKey(parentNode);
    self.keysToRemove.push(key);
    self.render();
  });
};

Tree.prototype.updateSelectedAndOnChange = function () {
  var self = this;
  this.$selectionContainer.on('change', 'input.option[type=checkbox]', function () {
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
      start: function start(event, ui) {
        startIndex = ui.item.index();
      },

      stop: function stop(event, ui) {
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

Tree.prototype.render = function (noCallbacks) {
  var _this = this;

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
    this.selectNodes[this.keysToAdd[jj]].getElementsByTagName('INPUT')[0].checked = true;
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
  options.sort(function (a, b) {
    var aValue = valHash[a.value] || 0;
    var bValue = valHash[b.value] || 0;
    return aValue - bValue;
  });

  this.$originalSelect.html(options);
  this.$originalSelect.find('option').each(function (idx, el) {
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
    var optionsSelected = this.selectedKeys.map(function (key) {
      return _this.selectOptions[key];
    });
    var optionsAdded = this.keysToAdd.map(function (key) {
      return _this.selectOptions[key];
    });
    var optionsRemoved = this.keysToRemove.map(function (key) {
      return _this.selectOptions[key];
    });
    this.options.onChange(optionsSelected, optionsAdded, optionsRemoved);
  }

  this.keysToRemove = [];
  this.keysToAdd = [];
};

module.exports = Tree;

},{"./option":2,"./search":3,"./ui-builder":6,"./utility":9}],6:[function(require,module,exports){
'use strict';

module.exports = function ($el, hideSidePanel) {
  var $tree = jQuery('<div class="tree-multiselect"></div>');

  var $selections = jQuery('<div class="selections"></div>');
  if (hideSidePanel) {
    $selections.addClass('no-border');
  }
  $tree.append($selections);

  var $selected = jQuery('<div class="selected"></div>');
  if (!hideSidePanel) {
    $tree.append($selected);
  }

  $el.after($tree);

  this.$tree = $tree;
  this.$selectionContainer = $selections;
  this.$selectedContainer = $selected;
};

},{}],7:[function(require,module,exports){
"use strict";

function subtract(arr1, arr2) {
  var hash = {};
  var returnArr = [];
  for (var ii = 0; ii < arr2.length; ++ii) {
    hash[arr2[ii]] = true;
  }
  for (var jj = 0; jj < arr1.length; ++jj) {
    if (!hash[arr1[jj]]) {
      returnArr.push(arr1[jj]);
    }
  }
  return returnArr;
}

function uniq(arr) {
  var hash = {};
  var newArr = [];
  for (var ii = 0; ii < arr.length; ++ii) {
    if (!hash[arr[ii]]) {
      hash[arr[ii]] = true;
      newArr.push(arr[ii]);
    }
  }
  return newArr;
}

function removeFalseyExceptZero(arr) {
  var newArr = [];
  for (var ii = 0; ii < arr.length; ++ii) {
    if (arr[ii] || arr[ii] === 0) {
      newArr.push(arr[ii]);
    }
  }
  return newArr;
}

function moveEl(arr, oldPos, newPos) {
  var el = arr[oldPos];
  arr.splice(oldPos, 1);
  arr.splice(newPos, 0, el);
}

function intersect(arr, arrExcluded) {
  var newArr = [];
  var hash = {};
  for (var ii = 0; ii < arrExcluded.length; ++ii) {
    hash[arrExcluded[ii]] = true;
  }
  for (var jj = 0; jj < arr.length; ++jj) {
    if (hash[arr[jj]]) {
      newArr.push(arr[jj]);
    }
  }
  return newArr;
}

// takes in array of arrays
// arrays are presorted
function intersectMany(arrays) {
  var indexLocations = [];
  var maxIndexLocations = [];
  arrays.forEach(function (array) {
    indexLocations.push(0);
    maxIndexLocations.push(array.length - 1);
  });

  var finalOutput = [];
  for (; indexLocations.length > 0 && indexLocations[0] <= maxIndexLocations[0]; ++indexLocations[0]) {
    // advance indices to be at least equal to first array element
    var terminate = false;
    for (var ii = 1; ii < arrays.length; ++ii) {
      while (arrays[ii][indexLocations[ii]] < arrays[0][indexLocations[0]] && indexLocations[ii] <= maxIndexLocations[ii]) {
        ++indexLocations[ii];
      }
      if (indexLocations[ii] > maxIndexLocations[ii]) {
        terminate = true;
        break;
      }
    }

    if (terminate) {
      break;
    }

    // check element equality
    var shouldAdd = true;
    for (var jj = 1; jj < arrays.length; ++jj) {
      if (arrays[0][indexLocations[0]] !== arrays[jj][indexLocations[jj]]) {
        shouldAdd = false;
        break;
      }
    }

    if (shouldAdd) {
      finalOutput.push(arrays[0][indexLocations[0]]);
    }
  }

  return finalOutput;
}

module.exports = {
  subtract: subtract,
  uniq: uniq,
  removeFalseyExceptZero: removeFalseyExceptZero,
  moveEl: moveEl,
  intersect: intersect,
  intersectMany: intersectMany
};

},{}],8:[function(require,module,exports){
'use strict';

function createNode(tag, props) {
  var node = document.createElement(tag);

  if (props) {
    for (var key in props) {
      if (props.hasOwnProperty(key) && key !== 'text') {
        node.setAttribute(key, props[key]);
      }
    }
    if (props.text) {
      node.textContent = props.text;
    }
  }
  return node;
}

function createSelection(option, treeId, createCheckboxes, disableCheckboxes) {
  var props = {
    class: 'item',
    'data-key': option.id,
    'data-value': option.value
  };
  var hasDescription = !!option.description;
  if (hasDescription) {
    props['data-description'] = option.description;
  }
  if (option.initialIndex) {
    props['data-index'] = option.initialIndex;
  }
  var selectionNode = createNode('div', props);

  if (hasDescription) {
    var popup = createNode('span', { class: 'description', text: '?' });
    selectionNode.appendChild(popup);
  }
  if (!createCheckboxes) {
    selectionNode.innerText = option.text || option.value;
  } else {
    var optionLabelCheckboxId = 'treemultiselect-' + treeId + '-' + option.id;
    var inputCheckboxProps = {
      class: 'option',
      type: 'checkbox',
      id: optionLabelCheckboxId
    };
    if (disableCheckboxes) {
      inputCheckboxProps.disabled = true;
    }
    var inputCheckbox = createNode('input', inputCheckboxProps);
    // prepend child
    selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);

    var labelProps = {
      for: optionLabelCheckboxId,
      text: option.text || option.value
    };
    var label = createNode('label', labelProps);
    selectionNode.appendChild(label);
  }

  return selectionNode;
}

function createSelected(option, disableRemoval, showSectionOnSelected) {
  var node = createNode('div', {
    class: 'item',
    'data-key': option.id,
    'data-value': option.value,
    text: option.text
  });

  if (!disableRemoval) {
    var removalSpan = createNode('span', { class: 'remove-selected', text: '×' });
    node.insertBefore(removalSpan, node.firstChild);
  }

  if (showSectionOnSelected) {
    var sectionSpan = createNode('span', { class: 'section-name', text: option.section });
    node.appendChild(sectionSpan);
  }

  return node;
}

function createSection(sectionName, sectionId, createCheckboxes, disableCheckboxes) {
  var sectionNode = createNode('div', { class: 'section', 'data-key': sectionId });

  var titleNode = createNode('div', { class: 'title', text: sectionName });
  if (createCheckboxes) {
    var checkboxProps = {
      class: 'section',
      type: 'checkbox'
    };
    if (disableCheckboxes) {
      checkboxProps.disabled = true;
    }
    var checkboxNode = createNode('input', checkboxProps);
    titleNode.insertBefore(checkboxNode, titleNode.firstChild);
  }
  sectionNode.appendChild(titleNode);
  return sectionNode;
}

module.exports = {
  createNode: createNode,
  createSelection: createSelection,
  createSelected: createSelected,
  createSection: createSection
};

},{}],9:[function(require,module,exports){
'use strict';

var utilArray = require('./array');
var utilDom = require('./dom');

function assert(bool, message) {
  if (!bool) {
    throw new Error(message || 'Assertion failed');
  }
}

function getKey(el) {
  assert(el);
  return parseInt(el.getAttribute('data-key'));
}

module.exports = {
  assert: assert,
  getKey: getKey,

  array: utilArray,
  dom: utilDom
};

},{"./array":7,"./dom":8}]},{},[4]);
