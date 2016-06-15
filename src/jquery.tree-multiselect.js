(function($) {
  "use strict";
  
  var ArrayFn = {
    forEach: (function () {
      if (Array.prototype.forEach) {
        return function (arr, fn, context) {
          Array.prototype.forEach.call(arr, fn, context)
        }
      } else {
        return function (arr, fn, context) {
          for (var k = 0, length = arr.length; k < length; k++) {
            if (typeof fn === "function" && Object.prototype.hasOwnProperty.call(arr, k)) {
              fn.call(context || arr, arr[k], k, arr);
            }
          }
        }
      }
    })(),
    map: (function () {
      if (Array.prototype.map) {
        return function (arr, fn, context) {
          Array.prototype.map.call(arr, fn, context)
        }
      } else {
        return function (arr, fn, context) {
          var ret = [];
          if (typeof fn === "function") {
            for (var k = 0, length = arr.length; k < length; k++) {
              ret.push(fn.call(context || arr, arr[k], k, arr));
            }
          }
          return ret;
        }
      }
    })(),
    filter: (function () {
      if (Array.prototype.filter) {
        return function (arr, fn, context) {
          Array.prototype.filter.call(arr, fn, context)
        }
      } else {
        return function (arr, fn, context) {
          var ret = [];
          if (typeof fn === "function") {
            for (var k = 0, length = arr.length; k < length; k++) {
              fn.call(context || arr[k], arr[k], k, arr) && ret.push(arr[k]);
            }
          }
          return ret;
        }
      }
    })(),
    indexOf: (function () {
      if (Array.prototype.indexOf) {
        return function (arr, searchElement, fromIndex) {
          Array.prototype.indexOf.call(arr, searchElement, fromIndex)
        }
      } else {
        return function (arr, searchElement, fromIndex) {
          var index = -1;
          fromIndex = fromIndex * 1 || 0;

          for (var k = 0, length = arr.length; k < length; k++) {
            if (k >= fromIndex && arr[k] === searchElement) {
              index = k;
              break;
            }
          }
          return index;
        }
      }
    })()
  }
  $.fn.treeMultiselect = function(opts) {
    var options = mergeDefaultOptions(opts);
    this.each(function() {
      var $originalSelect = $(this);
      $originalSelect.attr('multiple', '').css('display', 'none');

      var uiBuilder = new UiBuilder();
      uiBuilder.build($originalSelect, options.hideSidePanel);

      var $selectionContainer = $(uiBuilder.selections);
      var $selectedContainer = $(uiBuilder.selected);

      generateSelections($originalSelect, $selectionContainer, options);

      addDescriptionHover($selectionContainer, options);
      addCheckboxes($selectionContainer, options);
      checkPreselectedSelections($originalSelect, $selectionContainer, options);
      updateSelected($selectionContainer, $selectedContainer, $originalSelect, options);
      
      bindEvent($selectionContainer, $selectedContainer,$originalSelect,options);
      
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
    return $.extend({}, defaults, options);
  }

  function generateSelections($originalSelect, $selectionContainer, options) {
    // nested objects and arrays
    var data = {};

    function insertOption(path, option) {
      var currentPos = data;
      for (var i = 0; i < path.length; ++i) {
        var pathPart = path[i];

        if (!currentPos[pathPart]) {
          currentPos[pathPart] = [];
        }
        currentPos = currentPos[pathPart];

        if (i == path.length - 1) {
          currentPos.push(option);
          break;
        }

        pathPart = path[i + 1];
        var existingObj = null;
        for (var j = 0; j < currentPos.length; ++j) {
          var arrayItem = currentPos[j];
          if ((arrayItem.constructor != Option) &&
              $.isPlainObject(arrayItem) &&
              arrayItem[pathPart] &&
              (typeof arrayItem[pathPart] !== 'undefined')) {
            existingObj = arrayItem;
            break;
          }
        }

        if (existingObj) {
          currentPos = existingObj;
        } else {
          var newLength = currentPos.push({});
          currentPos = currentPos[newLength - 1];
        }
      }
    }

    $originalSelect.find("> option").each(function() {
      var $option = $(this);
      var path = ($option.attr('data-section')||'').split(options.sectionDelimiter);

      var optionValue = $option.val();
      var optionName = $option.text();
      var optionDescription = $option.attr('data-description');
      var optionIndex = $option.attr('data-index');
      var option = new Option(optionValue, optionName, optionDescription, optionIndex);
      insertOption(path, option);
    });

    fillSelections($selectionContainer, data);
  }

  function fillSelections($selectionContainer, data) {
    function createSection($sectionContainer, title) {
      var section = document.createElement('div');
      section.className = "section";

      var sectionTitle = document.createElement('div');
      sectionTitle.className = "title";
      sectionTitle.innerHTML = title;

      $(section).append(sectionTitle);
      $sectionContainer.append(section);
      return section;
    }

    function createSelection($itemContainer, option) {
      var text = option.text;
      var value = option.value;
      var description = option.description;
      var index = option.index;

      var selection = document.createElement('div');
      selection.className = "item";
      $(selection).text(text || value).attr({
        'data-value': value,
        'data-description': description,
        'data-index': index
      });
      $itemContainer.append(selection);
      return selection;
    }

    if (data.constructor == Option) {
      createSelection($selectionContainer, data);
    } else if ($.isArray(data)) {
      for (var i = 0; i < data.length; ++i) {
        fillSelections($selectionContainer, data[i]);
      }
    } else {
      for (var key in data) {
        if (!data.hasOwnProperty(key)) continue;
        var $section = $(createSection($selectionContainer, key));
        fillSelections($section, data[key]);
      }
    }
  }

  function addDescriptionHover($selectionContainer) {
    var $description = $("<span class='description'>?</span>");
    var targets = $selectionContainer.find("div.item[data-description!=''][data-description]");
    $description.prependTo(targets);

    $("div.item > span.description").unbind().mouseenter(function() {
      var $item = $(this).parent();
      var description = $item.attr('data-description');

      var descriptionDiv = document.createElement('div');
      descriptionDiv.className = "temp-description-popup";
      descriptionDiv.innerHTML = description;

      descriptionDiv.style.position = 'absolute';

      $item.append(descriptionDiv);
    }).mouseleave(function() {
      var $item = $(this).parent();
      $item.find("div.temp-description-popup").remove();
    });
  }

  function addCheckboxes($selectionContainer, options) {
    var $checkbox = $('<input />', { type: 'checkbox' });
    if (options.freeze) {
      $checkbox.attr('disabled', 'disabled');
    }

    var $targets = null;
    if (options.onlyBatchSelection) {
      $targets = $selectionContainer.find("div.title");
    } else if (options.allowBatchSelection) {
      $targets = $selectionContainer.find("div.title, div.item");
    } else {
      $targets = $selectionContainer.find("div.item");
    }

    $checkbox.prependTo($targets);
  }

  function checkPreselectedSelections($originalSelect, $selectionContainer) {
    var selectedOptions = $originalSelect.val();
    if (!selectedOptions) return;

    var $selectedOptionDivs = $(ArrayFn.filter($selectionContainer.find("div.item"),function() {
      var item = $(this);
      return ArrayFn.indexOf(selectedOptions,item.attr('data-value')) !== -1;
    }));
    $selectedOptionDivs.find("> input[type=checkbox]").prop('checked', true);
  }

  function bindEvent($selectionContainer, $selectedContainer,$originalSelect, options){
      
    $selectionContainer.on('click','input[type=checkbox]',function(){

      var $checkbox = $(this);
      var checkboxClass = $checkbox.parent().hasClass('title') ? 'title':'item';

      if(checkboxClass === 'title'){
        if(options.allowBatchSelection){
          armTitleCheckboxes($checkbox);
        }
      }else if(checkboxClass === 'item'){
        if(options.allowBatchSelection){
          checkParentsOnAllChildrenSelected($selectionContainer);
          showSemifilledOrUncheckParents($selectionContainer);
        }
      }

      updateSelected($selectionContainer, $selectedContainer, $originalSelect, options);
    })


    if (options.collapsible) {
      addCollapsibility($selectionContainer, options);
    }

    if (options.enableSelectAll) {
      createSelectAllButtons($selectionContainer, $selectedContainer, $originalSelect, options);
    }

    //armRemoveSelectedOnClick
    $selectedContainer.on('click',"span.remove-selected",function() {
      var value = $(this).parent().attr('data-value');
      var $matchingSelection = $selectionContainer.find("div.item[data-value='" + value + "']");
      var $matchingCheckbox = $matchingSelection.find("> input[type=checkbox]");
      $matchingCheckbox.prop('checked', false);
      $(this).parent().remove();
      checkParentsOnAllChildrenSelected($selectionContainer);
      showSemifilledOrUncheckParents($selectionContainer);
    });
  }

  function armTitleCheckboxes($titleCheckbox) {
      var $section = $titleCheckbox.closest("div.section");
      var $checkboxesToBeChanged = $section.find("input[type=checkbox]");
      var checked = $titleCheckbox.is(':checked');
      $checkboxesToBeChanged.prop('checked', checked);
  }

  function checkParentsOnAllChildrenSelected($selectionContainer) {
      var sections = $selectionContainer.find("div.section");
      sections.each(function() {
        var $section = $(this);
        var $sectionItems = $section.find("div.item");
        var $unselectedItems = $sectionItems.filter(function() {
          var $checkbox = $(this).find("> input[type=checkbox]");
          return !($checkbox.is(":checked"));
        });
        if ($unselectedItems.length === 0) {
          var sectionCheckbox = $(this).find("> div.title > input[type=checkbox]");
          sectionCheckbox.prop('checked', true);
        }
      });
  }

  function showSemifilledOrUncheckParents($selectionContainer) {
    var sections = $selectionContainer.find("div.section");
    sections.each(function() {
      var $section = $(this);
      var $items = $section.find("div.item");
      var numSelected = ArrayFn.filter($items,function() {
        var item = $(this);
        return item.find("> input[type=checkbox]").prop('checked');
      }).length;

      var $sectionCheckbox = $section.find("> div.title > input[type=checkbox]");
      var isIndeterminate = (numSelected !== 0 && numSelected !== $items.length);
      $sectionCheckbox.prop('indeterminate', isIndeterminate);
      if(numSelected === 0){
        $sectionCheckbox.prop('checked', false);
      }
    });
  }

  function addCollapsibility($selectionContainer, options) {
    var hideIndicator = "-";
    var expandIndicator = "+";

    var $titleDivs = $selectionContainer.find("div.title");

    var collapseDiv = document.createElement('span');
    collapseDiv.className = "collapse-section";
    if (options.startCollapsed) {
      $(collapseDiv).text(expandIndicator);
      $titleDivs.siblings().toggle();
    } else {
      $(collapseDiv).text(hideIndicator);
    }
    $titleDivs.prepend(collapseDiv);
    $selectionContainer.on('click','span.collapse-section',function(e){
      e.stopPropagation();
      var $collapseSection = $(this);
      var indicator = $collapseSection.text();
      $collapseSection.text(indicator ==  hideIndicator ? expandIndicator : hideIndicator);
      var $title = $collapseSection.parent();
      $title.siblings().toggle();
    })

    $selectionContainer.on('click','div.title',function(e){
      if(!$(e.target).is('input[type=checkbox]')){
        $(this).find("> span.collapse-section").trigger('click');
      }
    })
  }

  function createSelectAllButtons($selectionContainer, $selectedContainer, $originalSelect, options) {
    var $selectAll = $("<span class='select-all'></span>");
    $selectAll.text(options.selectAllText);
    var $unselectAll = $("<span class='unselect-all'></span>");
    $unselectAll.text(options.unselectAllText);

    var $selectAllContainer = $("<div class='select-all-container'></div>");

    $selectAllContainer.prepend($unselectAll);
    $selectAllContainer.prepend($selectAll);

    $selectionContainer.prepend($selectAllContainer);

    var $checkboxes = $selectionContainer.find("input[type=checkbox]");

    $selectAll.unbind().click(function(e) {
      $checkboxes.prop('checked', true);
      updateSelected($selectionContainer, $selectedContainer, $originalSelect, options);
    });

    $unselectAll.unbind().click(function(e) {
      $checkboxes.prop('checked', false);
      $checkboxes.prop('indeterminate', false);
      updateSelected($selectionContainer, $selectedContainer, $originalSelect, options);
    });
  }

  function updateSelected($selectionContainer, $selectedContainer, $originalSelect, options) {
    function createSelectedDiv(selection) {
      var text = selection.text;
      var value = selection.value;
      var sectionName = selection.sectionName;

      var item = document.createElement('div');
      item.className = "item";
      item.innerHTML = text;

      if (options.showSectionOnSelected) {
        var $sectionSpan = $("<span class='section-name'></span>");
        $sectionSpan.text(sectionName);
        $(item).append($sectionSpan);
      }

      if (!options.freeze) {
        $(item).prepend("<span class='remove-selected'>×</span>");
      }

      $(item).attr('data-value', value)
        .appendTo($selectedContainer);
    }

    function addNewFromSelected(selections) {
      var currentSelections = [];
      $selectedContainer.find("div.item").each(function() {
        currentSelections.push($(this).attr('data-value'));
      });

      var selectionsNotYetAdded = ArrayFn.filter(selections,function(selection) {
        return ArrayFn.indexOf(currentSelections,selection.value) == -1;
      });

      ArrayFn.forEach(selectionsNotYetAdded,function(selection) {
        createSelectedDiv(selection);
      });

      return selectionsNotYetAdded;
    }

    function removeOldFromSelected(selections) {
      var selectionTexts = [];
      ArrayFn.forEach(selections,function(selection) {
        selectionTexts.push(selection.value);
      });

      var removedValues = [];

      $selectedContainer.find("div.item").each(function(index, el) {
        var $item = $(el);
        var value = $item.attr('data-value');
        if (ArrayFn.indexOf(selectionTexts,value) == -1) {
          removedValues.push(value);
          $item.remove();
        }
      });

      var unselectedSelections = [];
      var allSelections = $selectionContainer.find("div.item");
      allSelections.each(function() {
        var $this = $(this);
        if (ArrayFn.indexOf(removedValues,$this.attr('data-value')) !== -1) {
          unselectedSelections.push(elToSelectionObject($this));
        }
      });
      return unselectedSelections;
    }

    function updateOriginalSelect() {
      var selected = [];
      $selectedContainer.find("div.item").each(function() {
        selected.push($(this).attr('data-value'));
      });

      $originalSelect.val(selected).change();

      $originalSelect.html($originalSelect.find("option").sort(function(a, b) {
        var aValue = ArrayFn.indexOf(selected,$(a).attr('value'));
        var bValue = ArrayFn.indexOf(selected,$(b).attr('value'));

        if (aValue > bValue) return 1;
        if (aValue < bValue) return -1;
        return 0;
      }));
    }

    function elToSelectionObject($el) {
      var text = textOf($el);
      var value = $el.attr('data-value');
      var initialIndex = $el.attr('data-index');
      $el.attr('data-index', undefined);

      var sectionName = $.map($el.parentsUntil($selectionContainer, "div.section").get().reverse(), function(parentSection) {
        return textOf($(parentSection).find("> div.title"));
      }).join(options.sectionDelimiter);

      return {
        text: text,
        value: value,
        initialIndex: initialIndex,
        sectionName: sectionName
      };
    }

    var initialRun = true;
    function update() {
      
      var $selectedBoxes = $selectionContainer.find("div.item").has("> input[type=checkbox]:checked");
      var selections = [];

      $selectedBoxes.each(function() {
        var $el = $(this);
        selections.push(elToSelectionObject($el));
      });

      selections.sort(function(a, b) {
        var aIndex = parseInt(a.initialIndex);
        var bIndex = parseInt(b.initialIndex);
        if (aIndex > bIndex) return 1;
        if (aIndex < bIndex) return -1;
        return 0;
      });

      var newlyAddedSelections = addNewFromSelected(selections);
      var newlyRemovedSelections = removeOldFromSelected(selections);
      updateOriginalSelect();

      if (initialRun) {
        initialRun = false;
      } else if (options.onChange) {
        options.onChange(selections, newlyAddedSelections, newlyRemovedSelections);
      }

      if (options.sortable && !options.freeze) {
        $selectedContainer.sortable({
          update: function(event, ui) {
            updateOriginalSelect();
          }
        });
      }
    }

    update();
  }

  // Helpers
  var UiBuilder = function() {};
  UiBuilder.prototype.build = function(el, hideSidePanel) {
    var tree = document.createElement('div');
    tree.className = "tree-multiselect";
    $(el).after(tree);

    var selections = document.createElement('div');
    selections.className = "selections";
    if (hideSidePanel) {
      selections.className += " no-border";
    }
    $(tree).append(selections);

    var selected = document.createElement('div');
    selected.className = "selected";
    if (!hideSidePanel) {
      $(tree).append(selected);
    }

    this.tree = tree;
    this.selections = selections;
    this.selected = selected;
  };

  var Option = function(value, text, description, index) {
    this.value = value;
    this.text = text;
    this.description = description;
    this.index = index;
  };



  function textOf(el) {
    return $(el).clone().children().remove().end().text();
  }
  
})(jQuery);

