/* jQuery Tree Multiselect v2.2.0 | (c) Patrick Tsai | MIT Licensed */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.createLookup = function (arr) {
  return {
    arr: arr,
    children: {}
  };
};

exports.createSection = function (name) {
  return {
    type: 'section',
    name: name,
    items: []
  };
};

exports.isSection = function (obj) {
  return obj && obj.type === 'section';
};

exports.getSectionName = function (section) {
  return section.name;
};

exports.getSectionItems = function (section) {
  return section.items;
};

exports.createItem = function (id, value, text, description, initialIndex, section) {
  return {
    type: 'item',
    id: id,
    value: value,
    text: text,
    description: description,
    initialIndex: initialIndex,
    section: section
  };
};

exports.isItem = function (obj) {
  return obj && obj.type === 'item';
};

},{}],2:[function(require,module,exports){
'use strict';

var Tree = require('./tree');

var uniqueId = 0;

var treeMultiselect = function treeMultiselect(opts) {
  var _this = this;

  var options = mergeDefaultOptions(opts);

  this.each(function () {
    var $originalSelect = _this;
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
    searchParams: ['value', 'text', 'description', 'section'],
    sectionDelimiter: '/',
    showSectionOnSelected: true,
    sortable: false,
    startCollapsed: false
  };
  return jQuery.extend({}, defaults, options);
}

module.exports = treeMultiselect;

},{"./tree":5}],3:[function(require,module,exports){
'use strict';

var Util = require('./utility');

var MAX_SAMPLE_SIZE = 3;

function Search(options, inSelectionNodeHash, inSectionNodeHash, searchParams) {
  this.options = options;

  this.index = {}; // key: at most three-letter combinations, value: array of data-key

  // key: data-key, value: DOM node
  this.selectionNodeHash = inSelectionNodeHash;
  this.selectionNodeHashKeys = Object.keys(inSelectionNodeHash);

  this.sectionNodeHash = inSectionNodeHash;
  this.sectionNodeHashKeys = Object.keys(inSectionNodeHash);

  this.setSearchParams(searchParams);

  this.buildIndex();
}

Search.prototype.setSearchParams = function (searchParams) {
  Util.assert(Array.isArray(searchParams));

  var allowedParams = {
    'value': true,
    'text': true,
    'description': true,
    'section': true
  };

  this.searchParams = [];
  for (var ii = 0; ii < searchParams.length; ++ii) {
    if (allowedParams[searchParams[ii]]) {
      this.searchParams.push(searchParams[ii]);
    }
  }
};

Search.prototype.buildIndex = function () {
  var _this = this;

  // options are sorted by id already
  // trigrams
  this.options.forEach(function (option) {
    var searchItems = [];
    _this.searchParams.forEach(function (searchParam) {
      searchItems.push(option[searchParam]);
    });
    Util.array.removeFalseyExceptZero(searchItems);
    var searchWords = searchItems.map(function (item) {
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
      _this2.sectionNodeHash[id].removeAttribute('searchhit');
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
          node.setAttribute('searchhit', true);
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

},{"./main":2}],5:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Ast = require('./ast');
var Search = require('./search');
var UiBuilder = require('./ui-builder');
var Util = require('./utility');

function Tree(id, $originalSelect, params) {
  this.id = id;
  this.$originalSelect = $originalSelect;

  this.uiBuilder = new UiBuilder($originalSelect, params.hideSidePanel);
  this.$selectionContainer = this.uiBuilder.$selectionContainer;
  this.$selectedContainer = this.uiBuilder.$selectedContainer;

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

Tree.prototype.initialize = function () {
  this.generateSelections(this.$selectionContainer[0]);

  this.popupDescriptionHover();

  if (this.params.allowBatchSelection) {
    this.handleSectionCheckboxMarkings();
  }

  if (this.params.collapsible) {
    this.addCollapsibility();
  }

  if (this.params.searchable || this.params.enableSelectAll) {
    var auxiliaryBox = Util.dom.createNode('div', { class: 'auxiliary' });
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

Tree.prototype.generateSelections = function (parentNode) {
  var options = this.$originalSelect.children('option');
  var ast = this.createAst(options);
  this.generateHtml(ast, parentNode);
};

Tree.prototype.createAst = function (options) {
  var _keysToAdd;

  var data = [];
  var lookup = Ast.createLookup(data);
  //var data = [[], {}];

  var self = this;
  var id = 0;
  var keysToAddAtEnd = [];
  options.each(function () {
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
    var sectionParts = section && section.length > 0 ? section.split(self.params.sectionDelimiter) : [];
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
  (_keysToAdd = this.keysToAdd).push.apply(_keysToAdd, keysToAddAtEnd);
  Util.array.uniq(this.keysToAdd);
  return data;
};

Tree.prototype.generateHtml = function (astArr, parentNode, sectionIdStart) {
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
      var _self$keysToAdd;

      (_self$keysToAdd = self.keysToAdd).push.apply(_self$keysToAdd, keys);
      Util.array.uniq(self.keysToAdd);
    } else {
      var _self$keysToRemove;

      (_self$keysToRemove = self.keysToRemove).push.apply(_self$keysToRemove, keys);
      Util.array.uniq(self.keysToRemove);
    }
    self.render();
  });
};

Tree.prototype.redrawSectionCheckboxes = function ($section) {
  $section = $section || this.$selectionContainer;

  // returns array; bit 1 is all children are true, bit 0 is all children are false
  var returnVal = 3;

  var self = this;
  var $childSections = $section.find('> div.section');
  $childSections.each(function () {
    var result = self.redrawSectionCheckboxes(jQuery(this));
    returnVal &= result;
  });

  if (returnVal) {
    var $childCheckboxes = $section.find('> div.item > input[type=checkbox]');
    for (var ii = 0; ii < $childCheckboxes.length; ++ii) {
      if ($childCheckboxes[ii].checked) {
        returnVal &= ~2;
      } else {
        returnVal &= ~1;
      }

      if (returnVal == 0) {
        break;
      }
    }
  }

  var sectionCheckbox = $section.find('> div.title > input[type=checkbox]');
  if (sectionCheckbox.length) {
    sectionCheckbox = sectionCheckbox[0];
    if (returnVal & 1) {
      sectionCheckbox.checked = true;
      sectionCheckbox.indeterminate = false;
    } else if (returnVal & 2) {
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
  var titleSelector = 'div.title';
  var $titleDivs = this.$selectionContainer.find(titleSelector);

  var collapseSpan = Util.dom.createNode('span', { class: 'collapse-section' });
  $titleDivs.prepend(collapseSpan);

  var sectionSelector = 'div.section';
  var $sectionDivs = this.$selectionContainer.find(sectionSelector);

  if (this.params.startCollapsed) {
    $sectionDivs.addClass('collapsed');
  }

  this.$selectionContainer.on('click', titleSelector, function (event) {
    if (event.target.nodeName == 'INPUT') {
      return;
    }

    var $section = jQuery(this).parent();
    $section.toggleClass('collapsed');
    event.stopPropagation();
  });
};

Tree.prototype.createSearchBar = function (parentNode) {
  var searchObj = new Search(this.selectOptions, this.selectNodes, this.sectionNodes, this.params.searchParams);

  var searchNode = Util.dom.createNode('input', { class: 'search', placeholder: 'Search...' });
  parentNode.appendChild(searchNode);

  this.$selectionContainer.on('input', 'input.search', function () {
    var searchText = this.value;
    searchObj.search(searchText);
  });
};

Tree.prototype.createSelectAllButtons = function (parentNode) {
  var selectAllNode = Util.dom.createNode('span', { class: 'select-all', text: this.params.selectAllText });
  var unselectAllNode = Util.dom.createNode('span', { class: 'unselect-all', text: this.params.unselectAllText });

  var selectAllContainer = Util.dom.createNode('div', { class: 'select-all-container' });
  selectAllContainer.appendChild(selectAllNode);
  selectAllContainer.appendChild(unselectAllNode);

  parentNode.appendChild(selectAllContainer);

  var self = this;
  this.$selectionContainer.on('click', 'span.select-all', function () {
    for (var ii = 0; ii < self.selectOptions.length; ++ii) {
      self.keysToAdd.push(ii);
    }
    Util.array.uniq(self.keysToAdd);
    self.render();
  });

  this.$selectionContainer.on('click', 'span.unselect-all', function () {
    var _self$keysToRemove2;

    (_self$keysToRemove2 = self.keysToRemove).push.apply(_self$keysToRemove2, _toConsumableArray(self.selectedKeys));
    Util.array.uniq(self.keysToRemove);
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

  if (this.params.sortable && !this.params.freeze) {
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
  var _selectedKeys,
      _this = this;

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
    this.selectNodes[this.keysToAdd[jj]].getElementsByTagName('INPUT')[0].checked = true;
  }

  (_selectedKeys = this.selectedKeys).push.apply(_selectedKeys, _toConsumableArray(this.keysToAdd));
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

  if (!noCallbacks && this.params.onChange) {
    var optionsSelected = this.selectedKeys.map(function (key) {
      return _this.selectOptions[key];
    });
    var optionsAdded = this.keysToAdd.map(function (key) {
      return _this.selectOptions[key];
    });
    var optionsRemoved = this.keysToRemove.map(function (key) {
      return _this.selectOptions[key];
    });
    this.params.onChange(optionsSelected, optionsAdded, optionsRemoved);
  }

  this.keysToRemove = [];
  this.keysToAdd = [];
};

module.exports = Tree;

},{"./ast":1,"./search":3,"./ui-builder":6,"./utility":9}],6:[function(require,module,exports){
'use strict';

function UiBuilder($el, hideSidePanel) {
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

  this.$el = $el;
  this.$tree = $tree;
  this.$selectionContainer = $selections;
  this.$selectedContainer = $selected;
}

UiBuilder.prototype.attach = function () {
  this.$el.after(this.$tree);
};

module.exports = UiBuilder;

},{}],7:[function(require,module,exports){
"use strict";

// keeps if pred is true
function filterInPlace(arr, pred) {
  var idx = 0;
  for (var ii = 0; ii < arr.length; ++ii) {
    if (pred(arr[ii])) {
      arr[idx] = arr[ii];
      ++idx;
    }
  }
  arr.length = idx;
  //arr.slice(0, idx);
}

exports.uniq = function (arr) {
  var hash = {};

  var pred = function pred(val) {
    var returnVal = !hash[val];
    hash[val] = true;
    return returnVal;
  };
  filterInPlace(arr, pred);
};

exports.removeFalseyExceptZero = function (arr) {
  var pred = function pred(val) {
    return val || val === 0;
  };
  filterInPlace(arr, pred);
};

exports.moveEl = function (arr, oldPos, newPos) {
  var el = arr[oldPos];
  arr.splice(oldPos, 1);
  arr.splice(newPos, 0, el);
};

exports.subtract = function (arr, arrExcluded) {
  var hash = {};

  for (var ii = 0; ii < arrExcluded.length; ++ii) {
    hash[arrExcluded[ii]] = true;
  }

  var pred = function pred(val) {
    return !hash[val];
  };
  filterInPlace(arr, pred);
};

exports.intersect = function (arr, arrExcluded) {
  var hash = {};

  for (var ii = 0; ii < arrExcluded.length; ++ii) {
    hash[arrExcluded[ii]] = true;
  }

  var pred = function pred(val) {
    return hash[val];
  };
  filterInPlace(arr, pred);
};

// takes in array of arrays
// arrays are presorted
exports.intersectMany = function (arrays) {
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
};

},{}],8:[function(require,module,exports){
'use strict';

exports.createNode = function (tag, props) {
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
};

exports.createSelection = function (option, treeId, createCheckboxes, disableCheckboxes) {
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
  var selectionNode = exports.createNode('div', props);

  if (hasDescription) {
    var popup = exports.createNode('span', { class: 'description', text: '?' });
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
    var inputCheckbox = exports.createNode('input', inputCheckboxProps);
    // prepend child
    selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);

    var labelProps = {
      for: optionLabelCheckboxId,
      text: option.text || option.value
    };
    var label = exports.createNode('label', labelProps);
    selectionNode.appendChild(label);
  }

  return selectionNode;
};

exports.createSelected = function (option, disableRemoval, showSectionOnSelected) {
  var node = exports.createNode('div', {
    class: 'item',
    'data-key': option.id,
    'data-value': option.value,
    text: option.text
  });

  if (!disableRemoval) {
    var removalSpan = exports.createNode('span', { class: 'remove-selected', text: '×' });
    node.insertBefore(removalSpan, node.firstChild);
  }

  if (showSectionOnSelected) {
    var sectionSpan = exports.createNode('span', { class: 'section-name', text: option.section });
    node.appendChild(sectionSpan);
  }

  return node;
};

exports.createSection = function (sectionName, sectionId, createCheckboxes, disableCheckboxes) {
  var sectionNode = exports.createNode('div', { class: 'section', 'data-key': sectionId });

  var titleNode = exports.createNode('div', { class: 'title', text: sectionName });
  if (createCheckboxes) {
    var checkboxProps = {
      class: 'section',
      type: 'checkbox'
    };
    if (disableCheckboxes) {
      checkboxProps.disabled = true;
    }
    var checkboxNode = exports.createNode('input', checkboxProps);
    titleNode.insertBefore(checkboxNode, titleNode.firstChild);
  }
  sectionNode.appendChild(titleNode);
  return sectionNode;
};

},{}],9:[function(require,module,exports){
'use strict';

exports.array = require('./array');

exports.assert = function (bool, message) {
  if (!bool) {
    throw new Error(message || 'Assertion failed');
  }
};

exports.dom = require('./dom');

exports.getKey = function (el) {
  exports.assert(el);
  return parseInt(el.getAttribute('data-key'));
};

},{"./array":7,"./dom":8}]},{},[4]);
