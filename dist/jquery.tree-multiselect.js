/* jQuery Tree Multiselect v2.5.0 | (c) Patrick Tsai | MIT Licensed */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Util = require('./utility');

function Section(obj) {
  obj = obj || {};

  this.treeId = obj.treeId;
  this.id = obj.id;
  this.name = obj.name;
  this.items = [];

  this.node = null;
}

Section.prototype.isSection = function () {
  return true;
};

Section.prototype.isItem = function () {
  return false;
};

Section.prototype.render = function (createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSection(this, createCheckboxes, disableCheckboxes);
  }
  return this.node;
};

function Item(obj) {
  obj = obj || {};

  this.treeId = obj.treeId;
  this.id = obj.id;
  this.value = obj.value;
  this.text = obj.text;
  this.description = obj.description;
  this.initialIndex = obj.initialIndex ? parseInt(obj.initialIndex) : null;
  this.section = obj.section;
  this.disabled = obj.disabled;
  this.selected = obj.selected;

  this.node = null;
}

Item.prototype.isSection = function () {
  return false;
};

Item.prototype.isItem = function () {
  return true;
};

Item.prototype.render = function (createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSelection(this, createCheckboxes, disableCheckboxes);
  }
  return this.node;
};

exports.createLookup = function (arr) {
  return {
    arr: arr,
    children: {}
  };
};

exports.createSection = function (obj) {
  return new Section(obj);
};

exports.createItem = function (obj) {
  return new Item(obj);
};

},{"./utility":9}],2:[function(require,module,exports){
'use strict';

var Tree = require('./tree');

var uniqueId = 0;

var treeMultiselect = function treeMultiselect(opts) {
  var _this = this;

  var options = mergeDefaultOptions(opts);

  return this.map(function () {
    var $originalSelect = _this;
    $originalSelect.attr('multiple', '').css('display', 'none');

    var tree = new Tree(uniqueId, $originalSelect, options);
    tree.initialize();

    ++uniqueId;

    return {
      reload: function reload() {
        tree.reload();
      },

      remove: function remove() {
        tree.remove();
      }
    };
  });
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

function Search(astItems, astSections, searchParams) {
  this.index = {}; // key: at most three-letter combinations, value: array of data-key

  // key: data-key, value: DOM node
  this.astItems = astItems;
  this.astItemKeys = Object.keys(astItems);

  this.astSections = astSections;
  this.astSectionKeys = Object.keys(astSections);

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

  var _loop = function _loop(astItemKey) {
    var astItem = _this.astItems[astItemKey];
    var searchItems = [];
    _this.searchParams.forEach(function (searchParam) {
      searchItems.push(astItem[searchParam]);
    });
    Util.array.removeFalseyExceptZero(searchItems);
    var searchWords = searchItems.map(function (item) {
      return item.toLowerCase();
    });

    searchWords.forEach(function (searchWord) {
      var words = searchWord.split(' ');
      words.forEach(function (word) {
        _this._addToIndex(word, astItem.id);
      });
    });
  };

  // trigrams
  for (var astItemKey in this.astItems) {
    _loop(astItemKey);
  }
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
    this.astItemKeys.forEach(function (id) {
      _this2.astItems[id].node.style.display = '';
    });
    this.astSectionKeys.forEach(function (id) {
      _this2.astSections[id].node.style.display = '';
      _this2.astSections[id].node.removeAttribute('searchhit');
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
    var node = _this3.astItems[id].node;
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
  this.astItemKeys.forEach(function (id) {
    if (!shownNodeIdsHash[id]) {
      _this3.astItems[id].node.style.display = 'none';
    }
  });
  this.astSectionKeys.forEach(function (id) {
    if (!sectionsToNotHideHash[id]) {
      _this3.astSections[id].node.style.display = 'none';
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

  this.params = params;

  this.resetState();
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

Tree.prototype.remove = function () {
  this.uiBuilder.remove();
  this.resetState();
};

Tree.prototype.reload = function () {
  this.remove();
  this.initialize();
};

Tree.prototype.resetState = function () {
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

Tree.prototype.generateSelections = function (parentNode) {
  var options = this.$originalSelect.children('option');
  var ast = this.createAst(options);
  this.generateHtml(ast, parentNode);
};

Tree.prototype.createAst = function (options) {
  var _keysToAdd;

  var data = [];
  var lookup = Ast.createLookup(data);

  var self = this;
  var itemId = 0;
  var sectionId = 0;

  var initialIndexItems = [];
  var keysToAddAtEnd = [];
  options.each(function () {
    var option = this;
    option.setAttribute('data-key', itemId);

    var item = Ast.createItem({
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

    if (item.initialIndex && item.selected) {
      initialIndexItems[item.initialIndex] = initialIndexItems[item.initialIndex] || [];
      initialIndexItems[item.initialIndex].push(itemId);
    } else if (item.selected) {
      keysToAddAtEnd.push(itemId);
    }
    self.astItems[itemId] = item;

    ++itemId;

    var lookupPosition = lookup;
    var section = item.section;
    var sectionParts = section && section.length > 0 ? section.split(self.params.sectionDelimiter) : [];
    for (var ii = 0; ii < sectionParts.length; ++ii) {
      var sectionPart = sectionParts[ii];
      if (lookupPosition.children[sectionPart]) {
        lookupPosition = lookupPosition.children[sectionPart];
      } else {
        var newSection = Ast.createSection({
          treeId: self.id,
          id: sectionId,
          name: sectionPart
        });
        ++sectionId;

        lookupPosition.arr.push(newSection);
        var newLookupNode = Ast.createLookup(newSection.items);
        lookupPosition.children[sectionPart] = newLookupNode;
        lookupPosition = newLookupNode;
      }
    }
    lookupPosition.arr.push(item);
  });
  this.keysToAdd = Util.array.flatten(initialIndexItems);
  Util.array.removeFalseyExceptZero(this.keysToAdd);
  (_keysToAdd = this.keysToAdd).push.apply(_keysToAdd, keysToAddAtEnd);
  Util.array.uniq(this.keysToAdd);
  return data;
};

Tree.prototype.generateHtml = function (astArr, parentNode) {
  for (var ii = 0; ii < astArr.length; ++ii) {
    var astObj = astArr[ii];
    if (astObj.isSection()) {
      this.astSections[astObj.id] = astObj;

      var createCheckboxes = this.params.allowBatchSelection;
      var disableCheckboxes = this.params.freeze;
      var node = astObj.render(createCheckboxes, disableCheckboxes);
      parentNode.appendChild(node);
      this.generateHtml(astObj.items, node);
    } else if (astObj.isItem()) {
      this.astItems[astObj.id] = astObj;

      var _createCheckboxes = !this.params.onlyBatchSelection;
      var _disableCheckboxes = this.params.freeze;
      var _node = astObj.render(_createCheckboxes, _disableCheckboxes);
      parentNode.appendChild(_node);
    }
  }
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
  this.$selectionContainer.on('click', 'input.section[type=checkbox]', function () {
    var $section = jQuery(this).closest('div.section');
    var $items = $section.find('div.item');
    var keys = $items.map(function (idx, el) {
      var key = Util.getKey(el);
      var astItem = self.astItems[key];
      if (!astItem.disabled) {
        return key;
      }
    }).get();

    if (this.checked) {
      var _self$keysToAdd;

      // TODO why does this always take this branch
      (_self$keysToAdd = self.keysToAdd).push.apply(_self$keysToAdd, _toConsumableArray(keys));
      Util.array.uniq(self.keysToAdd);
    } else {
      var _self$keysToRemove;

      (_self$keysToRemove = self.keysToRemove).push.apply(_self$keysToRemove, _toConsumableArray(keys));
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
      if ($childCheckboxes[ii].disabled) {
        // do nothing
      } else if ($childCheckboxes[ii].checked) {
        returnVal &= ~2;
      } else {
        returnVal &= ~1;
      }

      if (returnVal === 0) {
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
    if (event.target.nodeName === 'INPUT') {
      return;
    }

    var $section = jQuery(this).parent();
    $section.toggleClass('collapsed');
    event.stopPropagation();
  });
};

Tree.prototype.createSearchBar = function (parentNode) {
  var searchObj = new Search(this.astItems, this.astSections, this.params.searchParams);

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
    self.keysToAdd = Object.keys(self.astItems);
    self.render();
  });

  this.$selectionContainer.on('click', 'span.unselect-all', function () {
    var _self$keysToRemove2;

    (_self$keysToRemove2 = self.keysToRemove).push.apply(_self$keysToRemove2, _toConsumableArray(self.selectedKeys));
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
  this.$selectionContainer.on('click', 'input.option[type=checkbox]', function () {
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
  Util.array.uniq(this.keysToAdd);
  Util.array.uniq(this.keysToRemove);

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
    var selectionNode = this.astItems[this.keysToRemove[ii]].node;
    selectionNode.getElementsByTagName('INPUT')[0].checked = false;
  }

  Util.array.subtract(this.selectedKeys, this.keysToRemove);

  // now add items
  for (var jj = 0; jj < this.keysToAdd.length; ++jj) {
    // create selected divs
    var key = this.keysToAdd[jj];
    var astItem = this.astItems[key];
    this.selectedKeys.push(key);

    var selectedNode = Util.dom.createSelected(astItem, this.params.freeze, this.params.showSectionOnSelected);
    this.selectedNodes[astItem.id] = selectedNode;
    this.$selectedContainer.append(selectedNode);

    // check the checkboxes
    var inputNode = astItem.node.getElementsByTagName('INPUT')[0];
    if (inputNode) {
      inputNode.checked = true;
    }
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
    var value = this.astItems[this.selectedKeys[kk]].value;
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
    this.selected = !!originalValsHash[Util.getKey(el)];
  });
  // NOTE: the following does not work since jQuery duplicates option values with the same value
  //this.$originalSelect.val(vals).change();
  this.$originalSelect.change();

  if (!noCallbacks && this.params.onChange) {
    var optionsSelected = this.selectedKeys.map(function (key) {
      return _this.astItems[key];
    });
    var optionsAdded = this.keysToAdd.map(function (key) {
      return _this.astItems[key];
    });
    var optionsRemoved = this.keysToRemove.map(function (key) {
      return _this.astItems[key];
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
  this.$treeContainer = $tree;
  this.$selectionContainer = $selections;
  this.$selectedContainer = $selected;
}

UiBuilder.prototype.attach = function () {
  this.$el.after(this.$treeContainer);
};

UiBuilder.prototype.remove = function () {
  this.$treeContainer.remove();
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

exports.flatten = function (arr, r) {
  if (!Array.isArray(arr)) {
    return arr;
  }

  r = r || [];

  for (var ii = 0; ii < arr.length; ++ii) {
    if (Array.isArray(arr[ii])) {
      r.concat(exports.flatten(arr[ii], r));
    } else {
      r.push(arr[ii]);
    }
  }

  return r;
};

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

exports.createSelection = function (astItem, createCheckboxes, disableCheckboxes) {
  var props = {
    class: 'item',
    'data-key': astItem.id,
    'data-value': astItem.value
  };
  var hasDescription = !!astItem.description;
  if (hasDescription) {
    props['data-description'] = astItem.description;
  }
  if (astItem.initialIndex) {
    props['data-index'] = astItem.initialIndex;
  }
  var selectionNode = exports.createNode('div', props);

  if (hasDescription) {
    var popup = exports.createNode('span', { class: 'description', text: '?' });
    selectionNode.appendChild(popup);
  }
  if (!createCheckboxes) {
    selectionNode.innerText = astItem.text || astItem.value;
  } else {
    var optionLabelCheckboxId = 'treemultiselect-' + astItem.treeId + '-' + astItem.id;
    var inputCheckboxProps = {
      class: 'option',
      type: 'checkbox',
      id: optionLabelCheckboxId
    };
    if (disableCheckboxes || astItem.disabled) {
      inputCheckboxProps.disabled = true;
    }
    var inputCheckbox = exports.createNode('input', inputCheckboxProps);
    // prepend child
    selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);

    var labelProps = {
      class: astItem.disabled ? 'disabled' : '',
      for: optionLabelCheckboxId,
      text: astItem.text || astItem.value
    };
    var label = exports.createNode('label', labelProps);
    selectionNode.appendChild(label);
  }

  return selectionNode;
};

exports.createSelected = function (astItem, disableRemoval, showSectionOnSelected) {
  var node = exports.createNode('div', {
    class: 'item',
    'data-key': astItem.id,
    'data-value': astItem.value,
    text: astItem.text
  });

  if (!disableRemoval && !astItem.disabled) {
    var removalSpan = exports.createNode('span', { class: 'remove-selected', text: '×' });
    node.insertBefore(removalSpan, node.firstChild);
  }

  if (showSectionOnSelected) {
    var sectionSpan = exports.createNode('span', { class: 'section-name', text: astItem.section });
    node.appendChild(sectionSpan);
  }

  return node;
};

exports.createSection = function (astSection, createCheckboxes, disableCheckboxes) {
  var sectionNode = exports.createNode('div', { class: 'section', 'data-key': astSection.id });

  var titleNode = exports.createNode('div', { class: 'title', text: astSection.name });
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
