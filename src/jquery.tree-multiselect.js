/*
 * jQuery Tree Multiselect
 * v1.10.3
 *
 * (c) Patrick Tsai
 * MIT Licensed
 */

(function($) {
  var options;

  $.fn.treeMultiselect = function(opts) {
    var originalSelect = this;

    options = mergeDefaultOptions(opts);
    this.attr('multiple', '').css('display', 'none');

    var uiBuilder = new UiBuilder();
    uiBuilder.build(originalSelect);

    var selectionContainer = uiBuilder.selections;

    generateSelections(originalSelect, selectionContainer);

    addDescriptionHover(selectionContainer);
    addCheckboxes(selectionContainer);
    checkPreselectedSelections(originalSelect, selectionContainer);
    armTitleCheckboxes(selectionContainer);
    uncheckParentsOnUnselect(selectionContainer);

    if (options.collapsible) {
      addCollapsibility(selectionContainer);
    }

    var selectedContainer = uiBuilder.selected;
    updateSelectedAndOnChange(selectionContainer, selectedContainer, this);

    armRemoveSelectedOnClick(selectionContainer, selectedContainer);

    return this;
  };

  function textOf(el) {
    return $(el).clone().children().remove().end().text();
  }

  var UiBuilder = function() {};
  UiBuilder.prototype.build = function(el) {
    var tree = document.createElement('div');
    tree.className = "tree-multiselect";
    $(el).after(tree);

    var selections = document.createElement('div');
    selections.className = "selections";
    $(tree).append(selections);

    var selected = document.createElement('div');
    selected.className = "selected"
    $(tree).append(selected);

    this.tree = tree;
    this.selections = selections;
    this.selected = selected;
  }

  var Option = function(value, text, description, index) {
    this.value = value;
    this.text = text;
    this.description = description;
    this.index = index;
  };

  function mergeDefaultOptions(options) {
    var defaults = {
      sortable: false,
      collapsible: true,
      startCollapsed: false,
      sectionDelimiter: '/'
    };
    return $.extend({}, defaults, options);
  }

  function generateSelections(originalSelect, selectionContainer) {
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
          if ((arrayItem.constructor != Option) && $.isPlainObject(arrayItem) && arrayItem[pathPart] && (typeof arrayItem[pathPart] !== 'undefined')) {
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

    $(originalSelect).find("> option").each(function() {
      var path = $(this).attr('data-section').split(options.sectionDelimiter);
      var optionValue = $(this).val();
      var optionName = $(this).text();
      var optionDescription = $(this).attr('data-description');
      var optionIndex = $(this).attr('data-index');
      var option = new Option(optionValue, optionName, optionDescription, optionIndex);
      insertOption(path, option);
    });

    fillSelections.call(selectionContainer, data);
  }

  function fillSelections(data) {
    function createSection(title) {
      var section = document.createElement('div');
      section.className = "section";

      var sectionTitle = document.createElement('div');
      sectionTitle.className = "title";
      sectionTitle.innerHTML = title;

      $(section).append(sectionTitle);
      $(this).append(section);
      return section;
    }

    function createItem(option) {
      var text = option.text
        , value = option.value
        , description = option.description
        , index = option.index;
      var selection = document.createElement('div');
      selection.className = "item";
      $(selection).text(text || value).attr({
        'data-value': value,
        'data-description': description,
        'data-index': index
      });
      $(this).append(selection);
    }

    if (data.constructor == Option) {
      createItem.call(this, data);
    } else if ($.isArray(data)) {
      for (var i = 0; i < data.length; ++i) {
        fillSelections.call(this, data[i]);
      }
    } else if (typeof data === 'object') {
      for (var key in data) {
        if (!data.hasOwnProperty(key)) continue;
        var section = createSection.call(this, key);
        fillSelections.call(section, data[key]);
      }
    } else {
      createItem.call(this, data);
    }
  }

  function addDescriptionHover(selectionContainer) {
    var description = $("<span class='description'>?</span>");
    var targets = $(selectionContainer).find("div.item[data-description!=''][data-description]");
    description.prependTo(targets);

    $("div.item > span.description").unbind().mouseenter(function() {
      var item = $(this).parent();
      var description = item.attr('data-description');

      var descriptionDiv = document.createElement('div');
      descriptionDiv.className = "temp-description-popup";
      descriptionDiv.innerHTML = description;

      descriptionDiv.style.position = 'absolute';

      item.append(descriptionDiv);
    }).mouseleave(function() {
      $("div.temp-description-popup").remove();
    });
  }

  function addCheckboxes(selectionContainer) {
    var checkbox = $('<input />', { type: 'checkbox' });
    var targets = $(selectionContainer).find("div.title, div.item");
    checkbox.prependTo(targets);
  }

  function checkPreselectedSelections(originalSelect, selectionContainer) {
    var selectedOptions = $(originalSelect).val();
    if (!selectedOptions) return;

    for (var i = 0; i < selectedOptions.length; ++i) {
      var optionValue = selectedOptions[i];
      var selectionWithOption = $(selectionContainer).find("div.item").filter(function() {
        var item = $(this);
        return item.attr('data-value') === optionValue;
      });
      $(selectionWithOption).find("> input[type=checkbox]").prop('checked', true);
    }
  }

  function armTitleCheckboxes(selectionContainer) {
    var titleCheckboxes = $(selectionContainer).find("div.title > input[type=checkbox]");
    titleCheckboxes.change(function() {
      var section = $(this).closest("div.section");
      var checkboxesToBeChanged = section.find("input[type=checkbox]");
      var checked = $(this).is(':checked')
      checkboxesToBeChanged.prop('checked', checked);
    });
  }

  function uncheckParentsOnUnselect(selectionContainer) {
    var checkboxes = $(selectionContainer).find("input[type=checkbox]");
    checkboxes.change(function() {
      if ($(this).is(":checked")) return;
      var sectionParents = $(this).parents("div.section");
      sectionParents.find("> div.title > input[type=checkbox]").prop('checked', false);
    });
  }

  function addCollapsibility(selectionContainer) {
    var hideIndicator = "↑";
    var expandIndicator = "↓";

    var titleDivs = $(selectionContainer).find("div.title");

    var collapseDiv = document.createElement('span');
    collapseDiv.className = "collapse-section";
    if (options.startCollapsed) {
      $(collapseDiv).text(expandIndicator);
      titleDivs.siblings().toggle();
    } else {
      $(collapseDiv).text(hideIndicator);
    }
    titleDivs.prepend(collapseDiv);

    $("span.collapse-section").unbind().click(function() {
      var indicator = $(this).text();
      $(this).text(indicator ==  hideIndicator ? expandIndicator : hideIndicator);
      var jqTitle = $(this).parent();
      jqTitle.siblings().toggle();
    });
  }

  function updateSelectedAndOnChange(selectionContainer, selectedContainer, originalSelect) {
    function createSelectedDiv(text, value) {
      var item = document.createElement('div');
      item.className = "item";
      item.innerHTML = text;
      $(item).attr('data-value', value).prepend("<span class='remove-selected'>×</span>").appendTo(selectedContainer);
    }

    function addNewFromSelected(selections) {
      var currentSelections = [];
      $(selectedContainer).find("div.item").each(function() {
        currentSelections.push(textOf(this));
      });

      var selectionsNotAdded = selections.filter(function(selection) {
        return currentSelections.indexOf(selection.text) == -1;
      });

      selectionsNotAdded.forEach(function(selection) {
        createSelectedDiv(selection.text, selection.value);
      });

      armRemoveSelectedOnClick(selectionContainer, selectedContainer);
    }

    function removeOldFromSelected(selections) {
      var selectionTexts = [];
      selections.forEach(function(selection) {
        selectionTexts.push(selection.text);
      });

      $(selectedContainer).find("div.item").each(function() {
        var selection = textOf(this);
        if (selectionTexts.indexOf(selection) == -1) {
          $(this).remove();
        }
      });
    }

    function updateOriginalSelect() {
      var jqOriginalSelect = $(originalSelect);

      var selected = []
      $(selectedContainer).find("div.item").each(function() {
        selected.push($(this).attr('data-value'));
      });

      jqOriginalSelect.val(selected);

      $(originalSelect).html($(originalSelect).find("option").sort(function(a, b) {
        var aValue = selected.indexOf($(a).attr('value'));
        var bValue = selected.indexOf($(b).attr('value'));

        if (aValue > bValue) return 1;
        if (aValue < bValue) return -1;
        return 0;
      }));
    }

    function update() {
      var selectedBoxes = $(selectionContainer).find("div.item").has("> input[type=checkbox]:checked");
      var selections = [];
      selectedBoxes.each(function(box) {
        var text = textOf(this);
        var value = $(this).attr('data-value');
        var index = $(this).attr('data-index');
        $(this).attr('data-index', undefined);
        selections.push({ text: text, value: value, index: index });
      });
      selections.sort(function(a, b) {
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
      });

      addNewFromSelected(selections);
      removeOldFromSelected(selections);
      updateOriginalSelect();

      if (options.sortable) {
        var jqSelectedContainer = $(selectedContainer);
        jqSelectedContainer.sortable({
          update: function(event, ui) {
            updateOriginalSelect();
          }
        });
      }
    }

    var checkboxes = $(selectionContainer).find("input[type=checkbox]");
    checkboxes.change(function() {
      update();
    });

    update();
  }

  function armRemoveSelectedOnClick(selectionContainer, selectedContainer) {
    $(selectedContainer).find("span.remove-selected").click(function() {
      var value = $(this).parent().attr('data-value');
      console.log(value);
      var matchingSelection = $(selectionContainer).find("div.item[data-value='" + value + "']");
      var matchingCheckbox = matchingSelection.find("> input[type=checkbox]");
      matchingCheckbox.prop('checked', false);
      matchingCheckbox.trigger('change');
    });
  }
})(jQuery);
