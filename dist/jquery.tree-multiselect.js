/* jQuery Tree Multiselect v2.6.3 | (c) Patrick Tsai | MIT Licensed */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

(function ($) {
  'use strict';

  $.fn.treeMultiselect = require('./tree-multiselect/main');
})(jQuery);

},{"./tree-multiselect/main":6}],2:[function(require,module,exports){
"use strict";

var SEARCH_HIT_ATTR = 'searchhit';
var SEARCH_HIT_ATTR_VAL_TRUE = 'true';
var SEARCH_HIT_ATTR_VAL_FALSE = 'false';

exports.addSearchHitMarker = function (node, isSearchHit) {
  if (node) {
    isSearchHit = isSearchHit ? SEARCH_HIT_ATTR_VAL_TRUE : SEARCH_HIT_ATTR_VAL_FALSE;
    node.setAttribute(SEARCH_HIT_ATTR, isSearchHit);
  }
};

exports.removeSearchHitMarker = function (node, isSearchHit) {
  if (node) {
    node.removeAttribute(SEARCH_HIT_ATTR);
  }
};

exports.isNotSearchHit = function (node) {
  return node && node.getAttribute(SEARCH_HIT_ATTR) === SEARCH_HIT_ATTR_VAL_FALSE;
};

},{}],3:[function(require,module,exports){
"use strict";

var Item = require('./item');

var Section = require('./section');

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

},{"./item":4,"./section":5}],4:[function(require,module,exports){
"use strict";

var AstCommon = require('./common');

var Util = require('../utility');

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

Item.prototype.addSearchHitMarker = function (isSearchHit) {
  AstCommon.addSearchHitMarker(this.node, isSearchHit);
};

Item.prototype.removeSearchHitMarker = function (isSearchHit) {
  AstCommon.removeSearchHitMarker(this.node, isSearchHit);
};

Item.prototype.isNotSearchHit = function () {
  return AstCommon.isNotSearchHit(this.node);
};

Item.prototype.render = function (createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSelection(this, createCheckboxes, disableCheckboxes);
  }

  return this.node;
};

module.exports = Item;

},{"../utility":12,"./common":2}],5:[function(require,module,exports){
"use strict";

var AstCommon = require('./common');

var Util = require('../utility');

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

Section.prototype.addSearchHitMarker = function (isSearchHit) {
  AstCommon.addSearchHitMarker(this.node, isSearchHit);
};

Section.prototype.removeSearchHitMarker = function (isSearchHit) {
  AstCommon.removeSearchHitMarker(this.node, isSearchHit);
};

Section.prototype.isNotSearchHit = function () {
  return AstCommon.isNotSearchHit(this.node);
};

Section.prototype.render = function (createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSection(this, createCheckboxes, disableCheckboxes);
  }

  return this.node;
};

module.exports = Section;

},{"../utility":12,"./common":2}],6:[function(require,module,exports){
"use strict";

var Tree = require('./tree');

var uniqueId = 0;

function treeMultiselect(opts) {
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
}

;

function mergeDefaultOptions(options) {
  var defaults = {
    allowBatchSelection: true,
    collapsible: true,
    enableSelectAll: false,
    selectAllText: 'Select All',
    unselectAllText: 'Unselect All',
    freeze: false,
    hideSidePanel: false,
    maxSelections: 0,
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

},{"./tree":8}],7:[function(require,module,exports){
"use strict";

var Util = require('./utility');

var MAX_SAMPLE_SIZE = 3;

function Search(searchHitAttr, astItems, astSections, searchParams) {
  this.searchHitAttr = searchHitAttr;
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
    value: true,
    text: true,
    description: true,
    section: true
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
  for (var sampleSize = 1; sampleSize <= MAX_SAMPLE_SIZE; ++sampleSize) {
    for (var startOffset = 0; startOffset < key.length - sampleSize + 1; ++startOffset) {
      var minikey = key.substring(startOffset, startOffset + sampleSize);

      if (!this.index[minikey]) {
        this.index[minikey] = [];
      } // don't duplicate
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

  value = value.trim();

  if (!value) {
    this.astItemKeys.forEach(function (id) {
      _this2.astItems[id].removeSearchHitMarker();
    });
    this.astSectionKeys.forEach(function (id) {
      _this2.astSections[id].removeSearchHitMarker();
    });
    return;
  }

  value = value.toLowerCase();
  var searchWords = value.split(' ').filter(function (word) {
    return word;
  });
  var searchChunks = [];
  searchWords.forEach(function (searchWord) {
    var chunks = splitWord(searchWord);
    chunks.forEach(function (chunk) {
      searchChunks.push(_this2.index[chunk] || []);
    });
  });
  var matchedNodeIds = Util.array.intersectMany(searchChunks); // now we have id's that match search query

  this.handleNodeVisibilities(matchedNodeIds);
};

Search.prototype.handleNodeVisibilities = function (shownNodeIds) {
  var _this3 = this;

  var shownNodeIdsHash = {};
  var sectionsToNotHideHash = {};
  shownNodeIds.forEach(function (id) {
    shownNodeIdsHash[id] = true;
    var node = _this3.astItems[id].node; // now search for parent sections

    node = node.parentNode;

    while (!node.className.match(/tree-multiselect/)) {
      if (node.className.match(/section/)) {
        var key = Util.getKey(node);
        Util.assert(key || key === 0);

        if (sectionsToNotHideHash[key]) {
          break;
        } else {
          sectionsToNotHideHash[key] = true;
        }
      }

      node = node.parentNode;
    }
  }); // hide selections

  this.astItemKeys.forEach(function (id) {
    var isSearchHit = !!shownNodeIdsHash[id];

    _this3.astItems[id].addSearchHitMarker(isSearchHit);
  });
  this.astSectionKeys.forEach(function (id) {
    var isSearchHit = !!sectionsToNotHideHash[id];

    _this3.astSections[id].addSearchHitMarker(isSearchHit);
  });
}; // split word into three letter (or less) pieces


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

},{"./utility":12}],8:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Ast = require('./ast');

var Search = require('./search');

var UiBuilder = require('./ui-builder');

var Util = require('./utility');

var SEARCH_HIT_ATTR = 'searchhit';

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
    var auxiliaryBox = Util.dom.createNode('div', {
      "class": 'auxiliary'
    });
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
  var _this = this;

  var selectedOptions = {};
  this.selectedKeys.forEach(function (key) {
    var value = _this.astItems[key].value;
    selectedOptions[value] = true;
  });
  this.remove();
  this.$originalSelect.children('option').each(function (idx, element) {
    var value = element.value;

    if (selectedOptions[value]) {
      element.setAttribute('selected', 'selected');
    } else {
      element.removeAttribute('selected');
    }
  });
  this.initialize();
  this.render(true);
};

Tree.prototype.resetState = function () {
  this.uiBuilder = new UiBuilder(this.$originalSelect, this.params.hideSidePanel);
  this.$treeContainer = this.uiBuilder.$treeContainer;
  this.$selectionContainer = this.uiBuilder.$selectionContainer;
  this.$selectedContainer = this.uiBuilder.$selectedContainer; // data-key is key, provides DOM node

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
  var _this$keysToAdd;

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

  (_this$keysToAdd = this.keysToAdd).push.apply(_this$keysToAdd, keysToAddAtEnd);

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

      if (!astItem.disabled && !astItem.isNotSearchHit()) {
        return key;
      }

      return null;
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
  $section = $section || this.$selectionContainer; // returns array; bit 1 is all children are true, bit 0 is all children are false

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
  var collapseSpan = Util.dom.createNode('span', {
    "class": 'collapse-section'
  });
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
  var searchObj = new Search(SEARCH_HIT_ATTR, this.astItems, this.astSections, this.params.searchParams);
  var searchNode = Util.dom.createNode('input', {
    "class": 'search',
    placeholder: 'Search...'
  });
  parentNode.appendChild(searchNode);
  this.$selectionContainer.on('input', 'input.search', function () {
    var searchText = this.value;
    searchObj.search(searchText);
  });
};

Tree.prototype.createSelectAllButtons = function (parentNode) {
  var selectAllNode = Util.dom.createNode('span', {
    "class": 'select-all',
    text: this.params.selectAllText
  });
  var unselectAllNode = Util.dom.createNode('span', {
    "class": 'unselect-all',
    text: this.params.unselectAllText
  });
  var selectAllContainer = Util.dom.createNode('div', {
    "class": 'select-all-container'
  });
  selectAllContainer.appendChild(selectAllNode);
  selectAllContainer.appendChild(unselectAllNode);
  parentNode.appendChild(selectAllContainer);
  var self = this;
  this.$selectionContainer.on('click', 'span.select-all', function () {
    var _self$keysToAdd2;

    (_self$keysToAdd2 = self.keysToAdd).push.apply(_self$keysToAdd2, _toConsumableArray(self.unfilteredNodeIds()));

    self.render();
  });
  this.$selectionContainer.on('click', 'span.unselect-all', function () {
    var _self$keysToRemove2;

    (_self$keysToRemove2 = self.keysToRemove).push.apply(_self$keysToRemove2, _toConsumableArray(self.unfilteredNodeIds()));

    self.render();
  });
};

Tree.prototype.unfilteredNodeIds = function () {
  var self = this;
  return Object.keys(self.astItems).filter(function (key) {
    return !self.astItems[key].node.hasAttribute(SEARCH_HIT_ATTR) || self.astItems[key].node.getAttribute(SEARCH_HIT_ATTR) === 'true';
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
  var _this$selectedKeys,
      _this2 = this;

  // fix arrays first
  Util.array.uniq(this.keysToAdd);
  Util.array.uniq(this.keysToRemove);
  Util.array.subtract(this.keysToAdd, this.selectedKeys);
  Util.array.intersect(this.keysToRemove, this.selectedKeys); // check for max number of selections

  if (Util.isInteger(this.params.maxSelections) && this.params.maxSelections > 0) {
    var currentLength = this.keysToAdd.length - this.keysToRemove.length + this.selectedKeys.length;

    if (currentLength > this.params.maxSelections) {
      var _this$keysToRemove;

      var lengthToCut = currentLength - this.params.maxSelections;
      var keysToCut = [];

      if (lengthToCut > this.selectedKeys.length) {
        keysToCut.push.apply(keysToCut, _toConsumableArray(this.selectedKeys));
        lengthToCut -= this.selectedKeys.length;
        keysToCut.push.apply(keysToCut, _toConsumableArray(this.keysToAdd.splice(0, lengthToCut)));
      } else {
        keysToCut.push.apply(keysToCut, _toConsumableArray(this.selectedKeys.slice(0, lengthToCut)));
      }

      (_this$keysToRemove = this.keysToRemove).push.apply(_this$keysToRemove, keysToCut);
    }
  } // remove items first


  for (var ii = 0; ii < this.keysToRemove.length; ++ii) {
    // remove the selected divs
    var node = this.selectedNodes[this.keysToRemove[ii]];

    if (node) {
      // slightly more verbose than node.remove(), but more browser support
      node.parentNode.removeChild(node);
      this.selectedNodes[this.keysToRemove[ii]] = null;
    } // uncheck these checkboxes


    var selectionNode = this.astItems[this.keysToRemove[ii]].node;
    selectionNode.getElementsByTagName('INPUT')[0].checked = false;
  }

  Util.array.subtract(this.selectedKeys, this.keysToRemove); // now add items

  for (var jj = 0; jj < this.keysToAdd.length; ++jj) {
    // create selected divs
    var key = this.keysToAdd[jj];
    var astItem = this.astItems[key];
    this.selectedKeys.push(key);
    var selectedNode = Util.dom.createSelected(astItem, this.params.freeze, this.params.showSectionOnSelected);
    this.selectedNodes[astItem.id] = selectedNode;
    this.$selectedContainer.append(selectedNode); // check the checkboxes

    var inputNode = astItem.node.getElementsByTagName('INPUT')[0];

    if (inputNode) {
      inputNode.checked = true;
    }
  }

  (_this$selectedKeys = this.selectedKeys).push.apply(_this$selectedKeys, _toConsumableArray(this.keysToAdd));

  Util.array.uniq(this.selectedKeys); // redraw section checkboxes

  this.redrawSectionCheckboxes(); // now fix original select

  var originalValsHash = {}; // valHash hashes a value to an index

  var valHash = {};

  for (var kk = 0; kk < this.selectedKeys.length; ++kk) {
    var value = this.astItems[this.selectedKeys[kk]].value;
    originalValsHash[this.selectedKeys[kk]] = true;
    valHash[value] = kk;
  } // TODO is there a better way to sort the values other than by HTML?
  // NOTE: the following does not work since jQuery duplicates option values with the same value
  // this.$originalSelect.val(vals);


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
  this.$originalSelect.change();

  if (!noCallbacks && this.params.onChange) {
    var optionsSelected = this.selectedKeys.map(function (key) {
      return _this2.astItems[key];
    });
    var optionsAdded = this.keysToAdd.map(function (key) {
      return _this2.astItems[key];
    });
    var optionsRemoved = this.keysToRemove.map(function (key) {
      return _this2.astItems[key];
    });
    this.params.onChange(optionsSelected, optionsAdded, optionsRemoved);
  }

  this.keysToRemove = [];
  this.keysToAdd = [];
};

module.exports = Tree;

},{"./ast":3,"./search":7,"./ui-builder":9,"./utility":12}],9:[function(require,module,exports){
"use strict";

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

},{}],10:[function(require,module,exports){
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
}; // takes in array of arrays
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
    } // check element equality


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

},{}],11:[function(require,module,exports){
"use strict";

exports.createNode = function (tag, props) {
  var node = document.createElement(tag);

  if (props) {
    for (var key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key) && key !== 'text') {
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
    "class": 'item',
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
    var popup = exports.createNode('span', {
      "class": 'description',
      text: '?'
    });
    selectionNode.appendChild(popup);
  }

  if (!createCheckboxes) {
    selectionNode.innerText = astItem.text || astItem.value;
  } else {
    var optionLabelCheckboxId = "treemultiselect-".concat(astItem.treeId, "-").concat(astItem.id);
    var inputCheckboxProps = {
      "class": 'option',
      type: 'checkbox',
      id: optionLabelCheckboxId
    };

    if (disableCheckboxes || astItem.disabled) {
      inputCheckboxProps.disabled = true;
    }

    var inputCheckbox = exports.createNode('input', inputCheckboxProps); // prepend child

    selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);
    var labelProps = {
      "class": astItem.disabled ? 'disabled' : '',
      "for": optionLabelCheckboxId,
      text: astItem.text || astItem.value
    };
    var label = exports.createNode('label', labelProps);
    selectionNode.appendChild(label);
  }

  return selectionNode;
};

exports.createSelected = function (astItem, disableRemoval, showSectionOnSelected) {
  var node = exports.createNode('div', {
    "class": 'item',
    'data-key': astItem.id,
    'data-value': astItem.value,
    text: astItem.text
  });

  if (!disableRemoval && !astItem.disabled) {
    var removalSpan = exports.createNode('span', {
      "class": 'remove-selected',
      text: '×'
    });
    node.insertBefore(removalSpan, node.firstChild);
  }

  if (showSectionOnSelected) {
    var sectionSpan = exports.createNode('span', {
      "class": 'section-name',
      text: astItem.section
    });
    node.appendChild(sectionSpan);
  }

  return node;
};

exports.createSection = function (astSection, createCheckboxes, disableCheckboxes) {
  var sectionNode = exports.createNode('div', {
    "class": 'section',
    'data-key': astSection.id
  });
  var titleNode = exports.createNode('div', {
    "class": 'title',
    text: astSection.name
  });

  if (createCheckboxes) {
    var checkboxProps = {
      "class": 'section',
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

},{}],12:[function(require,module,exports){
"use strict";

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

exports.isInteger = function (value) {
  var x;

  if (isNaN(value)) {
    return false;
  }

  x = parseFloat(value);
  return (x | 0) === x;
};

},{"./array":10,"./dom":11}]},{},[1]);
