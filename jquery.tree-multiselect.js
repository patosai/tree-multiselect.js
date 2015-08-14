/* 
 *  jQuery Tree Multiselect  |  Patrick Tsai
 *     v1.0, August 2015     |  patosai.com
 *
 *        MIT Licensed
 */

(function($) {
  $.fn.treeMultiselect = function(data, options) {
    options = mergeDefaultOptions(options);
    this.attr('multiple', '').css('display', 'none').empty();

    var uiBuilder = new UiBuilder();
    uiBuilder.build(this);

    var selections = uiBuilder.selections;
    fillSelections.call(selections, data);
    addCheckboxes.call(selections);
    armTitleCheckboxes.call(selections);

    var selected = uiBuilder.selected;
    var isSortable = options.sortable;
    updateSelectedOnChange.call(selections, selected, this, isSortable);

    return this;
  };

  var UiBuilder = function() {};
  UiBuilder.prototype.build = function(el) {
    var tree = document.createElement('div');
    tree.className = "tree-multiselect";
    $(el).after(tree);

    var selected = document.createElement('div');
    selected.className = "selected"
    $(tree).append(selected);

    var selections = document.createElement('div');
    selections.className = "selections";
    $(tree).append(selections);

    this.tree = tree;
    this.selected = selected;
    this.selections = selections;
  }

  function mergeDefaultOptions(options) {
    var defaults = {
      sortable: false
    };
    return $.extend({}, defaults, options);
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

  function addCheckboxes() {
    var checkbox = $('<input />', { type: 'checkbox' });
    var targets = $(this).find("div.title, div.item");
    checkbox.prependTo(targets);
  }

  function armTitleCheckboxes() {
    var titleCheckboxes = $(this).find("div.title > input[type=checkbox]");
    titleCheckboxes.change(function() {
      var checked = $(this).is(':checked')
      var section = $(this).closest("div.section");
      var checkboxesToBeChanged = section.find("input[type=checkbox]");
      checkboxesToBeChanged.prop('checked', checked);
    });
  }

  function updateSelectedOnChange(selected, originalSelect, isSortable) {
    function updateOriginalSelect(selections) {
      var jqSelected = $(this);

      var jqOriginalSelect = $(originalSelect);
      jqOriginalSelect.empty();

      selections.forEach(function(text) {
        var option = document.createElement('option');
        jqOriginalSelect.append($(option).val(text).text(text).prop('selected', true));
      });
    }

    var allSelections = this;

    var allCheckboxes = $(allSelections).find("input[type=checkbox]");
    allCheckboxes.change(function() {
      var selections = $(allSelections).find("div.item").has("> input[type=checkbox]:checked");

      var jqSelected = $(selected);
      jqSelected.empty();

      if (isSortable) {
        jqSelected.sortable({
          update: function(event, ui) {
            var selectionArr = [];
            jqSelected.find("div.item").each(function(item) {
              selectionArr.push($(this).attr('id'));
            });
            updateOriginalSelect.call(selections, selectionArr);
          }
        });
      }

      var selectionArr = [];
      selections.text(function(index, text) {
        var item = document.createElement('div');
        item.className = "item";
        item.id = text;
        item.innerHTML = text;
        jqSelected.append(item);
        selectionArr.push(text);
      });

      updateOriginalSelect.call(selections, selectionArr);
    });
  }
})(jQuery);
