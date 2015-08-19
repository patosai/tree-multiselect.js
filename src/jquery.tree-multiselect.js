/*
 * jQuery Tree Multiselect
 * v1.6.2
 *
 * (c) Patrick Tsai
 * MIT Licensed
 */

(function($) {
  var options;

  $.fn.treeMultiselect = function(pkg) {
    pkg = pkg || {};
    var data = pkg.data;
    var opts = pkg.options;
    options = mergeDefaultOptions(opts);
    this.attr('multiple', '').css('display', 'none');

    var uiBuilder = new UiBuilder();
    uiBuilder.build(this);

    var selectionContainer = uiBuilder.selections;
    if (data) {
      fillSelections.call(selectionContainer, data);
    } else {
      var originalSelect = this;
      generateSelections(originalSelect, selectionContainer);
    }
    addCheckboxes(selectionContainer);
    armTitleCheckboxes(selectionContainer);
    uncheckParentsOnUnselect(selectionContainer);

    if (options.collapsible) {
      addCollapsibility(selectionContainer);
    }

    var selectedContainer = uiBuilder.selected;
    var isSortable = options.sortable;
    updateSelectedOnChange(selectionContainer, selectedContainer, this, isSortable);

    return this;
  };

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

    function insertOption(path, optionName) {
      var currentPos = data;
      for (var i = 0; i < path.length; ++i) {
        var pathPart = path[i];

        currentPos = currentPos[pathPart] = currentPos[pathPart] || [];
        
        if (i == path.length - 1) {
          currentPos.push(optionName);
          break;
        }

        pathPart = path[i + 1];
        var existingObj;
        for (var j = 0; j < currentPos.length; ++j) {
          var arrayItem = currentPos[j];
          if ((typeof arrayItem === 'object') && arrayItem[pathPart]) {
            existingObj = arrayItem;
            break;
          }
        }

        if (existingObj) {
          currentPos = existingObj;
        } else {
          currentPos.push({});
          currentPos = currentPos[currentPos.length - 1];
        }
      }
    }

    $(originalSelect).find("> option").each(function() {
      var path = $(this).attr('data-section').split(options.sectionDelimiter);
      var optionName = $(this).text() || $(this).value();
      insertOption(path, optionName);
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

    function createItem(value) {
      var selection = document.createElement('div');
      selection.className = "item";
      selection.innerHTML = value;
      $(this).append(selection);
    }

    if ($.isArray(data)) {
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

  function addCheckboxes(selectionContainer) {
    var checkbox = $('<input />', { type: 'checkbox' });
    var targets = $(selectionContainer).find("div.title, div.item");
    checkbox.prependTo(targets);
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
    var hideIndicator = "-";
    var expandIndicator = "+";

    var titleDivs = $(selectionContainer).find("div.title");

    var collapseDiv = document.createElement('div');
    collapseDiv.className = "collapse";
    if (options.startCollapsed) {
      $(collapseDiv).text(expandIndicator);
      titleDivs.siblings().toggle();
    } else {
      $(collapseDiv).text(hideIndicator);
    }
    titleDivs.prepend(collapseDiv);

    $("div.collapse").off().click(function() {
      var indicator = $(this).text();
      $(this).text(indicator ==  hideIndicator ? expandIndicator : hideIndicator);
      var jqTitle = $(this).parent();
      jqTitle.siblings().toggle();
    });
  }

  function updateSelectedOnChange(selectionContainer, selectedContainer, originalSelect, isSortable) {
    function createSelectedDiv(text) {
      var item = document.createElement('div');
      item.className = "item";
      item.innerHTML = text;
      $(selectedContainer).append(item);
    }

    function addNewFromSelected(selections) {
      var currentSelections = [];
      $(selectedContainer).find("div.item").each(function() {
        currentSelections.push($(this).text());
      });

      var selectionsNotAdded = selections.filter(function(selection) {
        return currentSelections.indexOf(selection) == -1;
      });

      selectionsNotAdded.forEach(function(text) {
        createSelectedDiv(text);
      });
    }

    function removeOldFromSelected(selections) {
      $(selectedContainer).find("div.item").each(function() {
        var selection = $(this).text();
        if (selections.indexOf(selection) == -1) {
          $(this).remove();
        }
      });
    }

    function updateOriginalSelect() {
      var jqOriginalSelect = $(originalSelect);
      jqOriginalSelect.empty();

      $(selectedContainer).find("div.item").text(function(index, text) {
        var option = document.createElement('option');
        jqOriginalSelect.append($(option).val(text).text(text).prop('selected', true));
      });
    }

    function update(selections) {
      addNewFromSelected(selections);
      removeOldFromSelected(selections);
      updateOriginalSelect();
    }

    var checkboxes = $(selectionContainer).find("input[type=checkbox]");
    checkboxes.change(function() {
      var selectedBoxes = $(selectionContainer).find("div.item").has("> input[type=checkbox]:checked");
      var selections = [];
      selectedBoxes.text(function(index, text) {
        selections.push(text);
      });

      update(selections);

      if (isSortable) {
        var jqSelectedContainer = $(selectedContainer);
        jqSelectedContainer.sortable({
          update: function(event, ui) {
            updateOriginalSelect();
          }
        });
      }
    });
  }
})(jQuery);
