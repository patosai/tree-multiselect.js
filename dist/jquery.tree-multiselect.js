/* jQuery Tree Multiselect v2.0.2 | (c) Patrick Tsai | MIT Licensed */
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
    sectionDelimiter: '/',
    showSectionOnSelected: true,
    sortable: false,
    startCollapsed: false
  };
  return jQuery.extend({}, defaults, options);
}

module.exports = treeMultiselect;

},{"./tree":4}],2:[function(require,module,exports){
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

(function ($) {
  'use strict';

  $.fn.treeMultiselect = require('./main');
})(jQuery);

},{"./main":1}],4:[function(require,module,exports){
'use strict';

var Option = require('./option');
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

  if (this.options.enableSelectAll) {
    this.createSelectAllButtons();
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

Tree.prototype.generateHtmlFromData = function (data, parentNode) {
  for (var ii = 0; ii < data[0].length; ++ii) {
    var option = data[0][ii];

    var selection = Util.dom.createSelection(option, this.id, !this.options.onlyBatchSelection, this.options.freeze);
    parentNode.appendChild(selection);
  }

  var keys = Object.keys(data[1]);
  for (var jj = 0; jj < keys.length; ++jj) {
    var title = keys[jj];

    var sectionNode = Util.dom.createSection(title, this.options.onlyBatchSelection || this.options.allowBatchSelection, this.options.freeze);
    parentNode.appendChild(sectionNode);
    this.generateHtmlFromData(data[1][keys[jj]], sectionNode);
  }

  //var str = '';
  //for (var ii = 0; ii < data[0].length; ++ii) {
  //var option = data[0][ii];

  //var optionLabelCheckboxId = `treemultiselect-${this.id}-${option.id}`;
  //var descriptionStr = option.description ? ` data-description='${option.description}'` : '';
  //var indexStr = option.initialIndex ? ` data-index='${option.initialIndex}'` : '';
  //var optionCheckboxStr = '';
  //var optionLabelStr = '';
  //if (!this.options.onlyBatchSelection) {
  //optionCheckboxStr += `<input class='option' type='checkbox' id='${optionLabelCheckboxId}'`;
  //if (this.options.freeze) {
  //optionCheckboxStr += ' disabled';
  //}
  //optionCheckboxStr += '/>';
  //optionLabelStr += `<label for='${optionLabelCheckboxId}'>${option.text || option.value}</label>`;
  //} else {
  //optionLabelStr += `${option.text || option.value}`;
  //}
  //var descriptionPopupStr = option.description ? '<span class="description">?</span>' : '';

  //str += `<div class='item' data-key='${option.id}'data-value='${option.value}'${descriptionStr}${indexStr}>${optionCheckboxStr}${descriptionPopupStr}${optionLabelStr}</div>`;
  //}

  //var keys = Object.keys(data[1]);
  //for (var jj = 0; jj < keys.length; ++jj) {
  //var sectionCheckboxStr = '';
  //if (this.options.onlyBatchSelection || this.options.allowBatchSelection) {
  //sectionCheckboxStr += '<input class="section" type="checkbox"';
  //if (this.options.freeze) {
  //sectionCheckboxStr += ' disabled';
  //}
  //sectionCheckboxStr += '/>';
  //}

  //var generatedData = this.generateHtmlFromData(data[1][keys[jj]]);
  //str += `<div class='section'><div class='title'>${sectionCheckboxStr}${keys[jj]}</div>${generatedData}</div>`;
  //}
  //return str;
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

  var collapseDiv = document.createElement('span');
  collapseDiv.className = 'collapse-section';
  if (this.options.startCollapsed) {
    jQuery(collapseDiv).text(expandIndicator);
    $titleDivs.siblings().toggle();
  } else {
    jQuery(collapseDiv).text(hideIndicator);
  }
  $titleDivs.prepend(collapseDiv);

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

Tree.prototype.createSelectAllButtons = function () {
  var $selectAll = jQuery('<span class="select-all"></span>');
  $selectAll.text(this.options.selectAllText);
  var $unselectAll = jQuery('<span class="unselect-all"></span>');
  $unselectAll.text(this.options.unselectAllText);

  var $selectAllContainer = jQuery('<div class="select-all-container"></div>');

  $selectAllContainer.prepend($unselectAll);
  $selectAllContainer.prepend($selectAll);

  this.$selectionContainer.prepend($selectAllContainer);

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
  var self = this;
  var $selectionItems = this.$selectionContainer.find('div.item');

  // remove the selected divs
  this.$selectedContainer.find('div.item').filter(function () {
    var key = Util.getKey(this);
    return self.keysToRemove.indexOf(key) !== -1;
  }).remove();

  // uncheck these checkboxes
  $selectionItems.filter(function () {
    var key = Util.getKey(this);
    return self.keysToRemove.indexOf(key) !== -1;
  }).find('> input[type=checkbox]').prop('checked', false);

  this.selectedKeys = Util.array.subtract(this.selectedKeys, this.keysToRemove);

  // now add items
  var domStr = '';
  for (var jj = 0; jj < this.keysToAdd.length; ++jj) {
    var key = this.keysToAdd[jj];
    var option = this.selectOptions[key];
    this.selectedKeys.push(key);

    var freezeStr = this.options.freeze ? '' : '<span class="remove-selected">×</span>';
    var sectionNameStr = this.options.showSectionOnSelected ? '<span class=\'section-name\'>' + option.section + '</span>' : '';
    domStr += '<div class=\'item\' data-key=\'' + option.id + '\' data-value=\'' + option.value + '\'>' + freezeStr + sectionNameStr + option.text + '</div>';
  }
  this.$selectedContainer.append(domStr);

  // check the checkboxes
  $selectionItems.filter(function () {
    var key = Util.getKey(this);
    return self.keysToAdd.indexOf(key) !== -1;
  }).find('> input[type=checkbox]').prop('checked', true);

  this.selectedKeys = Util.array.uniq(this.selectedKeys.concat(this.keysToAdd));

  // redraw section checkboxes
  this.redrawSectionCheckboxes();

  // now fix original select
  var originalValsHash = {};
  // valHash hashes a value to an index
  var valHash = {};
  for (var ii = 0; ii < this.selectedKeys.length; ++ii) {
    var value = this.selectOptions[this.selectedKeys[ii]].value;
    originalValsHash[this.selectedKeys[ii]] = true;
    valHash[value] = ii;
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

},{"./option":2,"./ui-builder":5,"./utility":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
'use strict';

// Note: array functions are only tested for for arrays of integers
// since that is what this plugin needs

module.exports = {
  assert: function assert(bool, message) {
    if (!bool) {
      throw new Error(message || 'Assertion failed');
    }
  },
  getKey: function getKey(el) {
    this.assert(el);
    return parseInt(el.getAttribute('data-key'));
  },


  array: {
    subtract: function subtract(arr1, arr2) {
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
    },
    uniq: function uniq(arr) {
      var hash = {};
      var newArr = [];
      for (var ii = 0; ii < arr.length; ++ii) {
        if (!hash[arr[ii]]) {
          hash[arr[ii]] = true;
          newArr.push(arr[ii]);
        }
      }
      return newArr;
    },
    removeFalseyExceptZero: function removeFalseyExceptZero(arr) {
      var newArr = [];
      for (var ii = 0; ii < arr.length; ++ii) {
        if (arr[ii] || arr[ii] === 0) {
          newArr.push(arr[ii]);
        }
      }
      return newArr;
    },
    moveEl: function moveEl(arr, oldPos, newPos) {
      var el = arr[oldPos];
      arr.splice(oldPos, 1);
      arr.splice(newPos, 0, el);
    },
    intersect: function intersect(arr, arrExcluded) {
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
  },

  dom: {
    createNode: function createNode(tag, props) {
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
    },
    createSelection: function createSelection(option, treeId, createCheckboxes, disableCheckboxes) {
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

      var selectionNode = this.createNode('div', props);

      if (hasDescription) {
        var popup = this.createNode('span', { class: 'description', text: '?' });
        selectionNode.appendChild(popup);
      }

      if (createCheckboxes) {
        var optionLabelCheckboxId = 'treemultiselect-' + treeId + '-' + option.id;
        var inputCheckboxProps = {
          class: 'option',
          type: 'checkbox',
          id: optionLabelCheckboxId
        };
        if (disableCheckboxes) {
          inputCheckboxProps.disabled = true;
        }
        var inputCheckbox = this.createNode('input', inputCheckboxProps);
        // prepend child
        selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);

        var labelProps = {
          for: optionLabelCheckboxId,
          text: option.text || option.value
        };
        var label = this.createNode('label', labelProps);
        selectionNode.appendChild(label);
      } else {
        selectionNode.innerText = option.text || option.value;
      }

      return selectionNode;
    },
    createSection: function createSection(sectionName, createCheckboxes, disableCheckboxes) {
      var sectionNode = this.createNode('div', { class: 'section' });

      var titleNode = this.createNode('div', { class: 'title', text: sectionName });
      if (createCheckboxes) {
        var checkboxProps = {
          class: 'section',
          type: 'checkbox'
        };
        if (disableCheckboxes) {
          checkboxProps.disabled = true;
        }
        var checkboxNode = this.createNode('input', checkboxProps);
        titleNode.insertBefore(checkboxNode, titleNode.firstChild);
      }
      sectionNode.appendChild(titleNode);
      return sectionNode;
    }
  }
};

},{}]},{},[3]);
