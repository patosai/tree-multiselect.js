var Option = require('./option');
var UiBuilder = require('./ui-builder');
var Util = require('./utility');

var treeMultiselect = function(opts) {
  var options = mergeDefaultOptions(opts);
  this.each(() => {
    var $originalSelect = $(this);
    $originalSelect.attr('multiple', '').css('display', 'none');

  var time = new Date().getTime();
    var uiBuilder = new UiBuilder($originalSelect, options.hideSidePanel);
  console.log("BUILT UI IN ", new Date().getTime() - time);

    var $selectionContainer = uiBuilder.$selections;

  time = new Date().getTime();
    generateSelections($originalSelect, $selectionContainer, options);
  console.log("GENERATED SELECTIONS IN ", new Date().getTime() - time);

  time = new Date().getTime();
    popupDescriptionHover($selectionContainer, options);
    checkPreselectedSelections($originalSelect, $selectionContainer, options);
  console.log("added stuff IN ", new Date().getTime() - time);

  time = new Date().getTime();
    if (options.allowBatchSelection) {
      armTitleCheckboxes($selectionContainer, options);
      uncheckParentsOnUnselect($selectionContainer, options);
      checkParentsOnAllChildrenSelected($selectionContainer, options);
      showSemifilledParents($selectionContainer, options);
    }
  console.log("BATCH SELECTION DONE IN ", new Date().getTime() - time);

  time = new Date().getTime();
    if (options.collapsible) {
      addCollapsibility($selectionContainer, options);
    }
  console.log("COLLAPSIBILITY IN ", new Date().getTime() - time);

  time = new Date().getTime();
    if (options.enableSelectAll) {
      createSelectAllButtons($selectionContainer, options);
    }
  console.log("SELECT ALL IN ", new Date().getTime() - time);

  time = new Date().getTime();
    var $selectedContainer = uiBuilder.$selected;
    updateSelectedAndOnChange($selectionContainer, $selectedContainer, $originalSelect, options);
    armRemoveSelectedOnClick($selectionContainer, $selectedContainer, options);
  console.log("END DONE IN ", new Date().getTime() - time);
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
  // [ [options directly under this section], {nested sections}]
  var data = [[], {}];

  $originalSelect.find("> option").each(function() {
    var option = this;
    var attributes = option.attributes;
    var sectionItem = attributes.getNamedItem("data-section");
    var section = sectionItem ? sectionItem.value : null;
    var path = (section && section.length > 0) ? section.split(options.sectionDelimiter) : [];

    var optionValue = option.value;
    var optionName = option.text;
    var optionDescriptionItem = attributes.getNamedItem("data-description");
    var optionDescription = optionDescriptionItem ? optionDescriptionItem.value : null;
    var optionIndexItem = attributes.getNamedItem("data-index");
    var optionIndex = optionIndexItem ? optionIndexItem.value : null;
    var optionObj = new Option(optionValue, optionName, optionDescription, optionIndex);

    var currentPosition = data;
    for (var ii = 0; ii < path.length; ++ii) {
      if (!currentPosition[1][path[ii]]) {
        currentPosition[1][path[ii]] = [[], {}];
      }
      currentPosition = currentPosition[1][path[ii]];
    }
    currentPosition[0].push(optionObj);
  });


  $selectionContainer.append(generateHtmlFromData(data, options));
}

function generateHtmlFromData(data, options) {
  var str = "";
  var option = null;
  for (var ii = 0; ii < data[0].length; ++ii) {
    option = data[0][ii];

    var descriptionStr = option.description ? ` data-description='${option.description}'` : "";
    var indexStr = option.index ? ` data-index='${option.index}'` : "";
    var optionCheckboxStr = "";
    if (!options.onlyBatchSelection) {
      optionCheckboxStr += "<input type='checkbox'";
      if (options.freeze) {
        optionCheckboxStr += " disabled";
      }
      optionCheckboxStr += "/>";
    }
    var descriptionPopupStr = option.description ? "<span class='description'>?</span>" : "";

    str += `<div class='item' data-value='${option.value}'${descriptionStr}${indexStr}>${(option.text || option.value)}${optionCheckboxStr}${descriptionPopupStr}</div>`;
  }

  var keys = Object.keys(data[1]);
  for (var jj = 0; jj < keys.length; ++jj) {
    var sectionCheckboxStr = "";
    if (options.onlyBatchSelection || options.allowBatchSelection) {
      sectionCheckboxStr += "<input type='checkbox'";
      if (options.freeze) {
        sectionCheckboxStr += " disabled";
      }
      sectionCheckboxStr += "/>";
    }

    str += `<div class='section'><div class='title'>${sectionCheckboxStr}${keys[jj]}</div>${generateHtmlFromData(data[1][keys[jj]], options)}</div>`;
  }
  return str;
}

function popupDescriptionHover($selectionContainer) {
  $selectionContainer.on("mouseenter", "div.item > span.description", function() {
    var $item = $(this).parent();
    var description = $item.attr('data-description');

    var descriptionDiv = document.createElement('div');
    descriptionDiv.className = "temp-description-popup";
    descriptionDiv.innerHTML = description;

    descriptionDiv.style.position = 'absolute';

    $item.append(descriptionDiv);
  });
  $selectionContainer.on("mouseleave", "div.item > span.description", function() {
    var $item = $(this).parent();
    $item.find("div.temp-description-popup").remove();
  });
}

function checkPreselectedSelections($originalSelect, $selectionContainer) {
  var selectedOptions = $originalSelect.val();
  if (!selectedOptions) return;

  var $selectedOptionDivs = $selectionContainer.find("div.item").filter(function() {
    var item = $(this);
    return selectedOptions.indexOf(item.attr('data-value')) !== -1;
  });
  $selectedOptionDivs.find("> input[type=checkbox]").prop('checked', true);
}

function armTitleCheckboxes($selectionContainer) {
  $selectionContainer.on("change", "div.title > input[type=checkbox]", function() {
    var $titleCheckbox = $(this);
    var $section = $titleCheckbox.closest("div.section");
    var $checkboxesToBeChanged = $section.find("input[type=checkbox]");
    var checked = $titleCheckbox.is(':checked');
    $checkboxesToBeChanged.prop('checked', checked);
  });
}

function uncheckParentsOnUnselect($selectionContainer) {
  $selectionContainer.on("change", "input[type=checkbox]", function() {
    var $checkbox = $(this);
    if ($checkbox.is(":checked")) return;
    var $sectionParents = $checkbox.parentsUntil($selectionContainer, "div.section");
    $sectionParents.find("> div.title > input[type=checkbox]").prop('checked', false);
  });
}

function checkParentsOnAllChildrenSelected($selectionContainer) {
  function check() {
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

  Util.onCheckboxChange($selectionContainer, check);
}

function showSemifilledParents($selectionContainer) {
  function check() {
    var sections = $selectionContainer.find("div.section");
    sections.each(function() {
      var $section = $(this);
      var $items = $section.find("div.item");
      var numSelected = $items.filter(function() {
        var item = $(this);
        return item.find("> input[type=checkbox]").prop('checked');
      }).length;

      var $sectionCheckbox = $section.find("> div.title > input[type=checkbox]");
      var isIndeterminate = (numSelected !== 0 && numSelected !== $items.length);
      $sectionCheckbox.prop('indeterminate', isIndeterminate);
    });
  }

  Util.onCheckboxChange($selectionContainer, check);
}

function addCollapsibility($selectionContainer, options) {
  var hideIndicator = "-";
  var expandIndicator = "+";

  var titleSelector = "div.title";
  var $titleDivs = $selectionContainer.find(titleSelector);

  var collapseDiv = document.createElement('span');
  collapseDiv.className = "collapse-section";
  if (options.startCollapsed) {
    $(collapseDiv).text(expandIndicator);
    $titleDivs.siblings().toggle();
  } else {
    $(collapseDiv).text(hideIndicator);
  }
  $titleDivs.prepend(collapseDiv);

  $selectionContainer.on("click", titleSelector, function() {
    var $collapseSection = $(this).find("> span.collapse-section");
    var indicator = $collapseSection.text();
    $collapseSection.text(indicator ==  hideIndicator ? expandIndicator : hideIndicator);
    var $title = $collapseSection.parent();
    $title.siblings().toggle();
  });
}

function createSelectAllButtons($selectionContainer, options) {
  var $selectAll = $("<span class='select-all'></span>");
  $selectAll.text(options.selectAllText);
  var $unselectAll = $("<span class='unselect-all'></span>");
  $unselectAll.text(options.unselectAllText);

  var $selectAllContainer = $("<div class='select-all-container'></div>");

  $selectAllContainer.prepend($unselectAll);
  $selectAllContainer.prepend($selectAll);

  $selectionContainer.prepend($selectAllContainer);

  $selectionContainer.on("click", "span.select-all", function() {
    handleCheckboxes(true);
  });

  $selectionContainer.on("click", "span.unselect-all", function() {
    handleCheckboxes(false);
  });

  function handleCheckboxes(checked) {
    var $checkboxes = $selectionContainer.find("input[type=checkbox]");
    $checkboxes.prop('checked', checked);
    $checkboxes.first().change();
  }
}

function updateSelectedAndOnChange($selectionContainer, $selectedContainer, $originalSelect, options) {
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

    var selectionsNotYetAdded = selections.filter(function(selection) {
      return currentSelections.indexOf(selection.value) == -1;
    });

    selectionsNotYetAdded.forEach(function(selection) {
      createSelectedDiv(selection);
    });

    armRemoveSelectedOnClick($selectionContainer, $selectedContainer);

    return selectionsNotYetAdded;
  }

  function removeOldFromSelected(selections) {
    var selectionTexts = [];
    selections.forEach(function(selection) {
      selectionTexts.push(selection.value);
    });

    var removedValues = [];

    $selectedContainer.find("div.item").each(function(index, el) {
      var $item = $(el);
      var value = $item.attr('data-value');
      if (selectionTexts.indexOf(value) == -1) {
        removedValues.push(value);
        $item.remove();
      }
    });

    var unselectedSelections = [];
    var allSelections = $selectionContainer.find("div.item");
    allSelections.each(function() {
      var $this = $(this);
      if (removedValues.indexOf($this.attr('data-value')) !== -1) {
        unselectedSelections.push(elToSelectionObject($this));
      }
    });
    return unselectedSelections;
  }

  function elToSelectionObject($el) {
    var text = Util.textOf($el);
    var value = $el.attr('data-value');
    var initialIndex = $el.attr('data-index');
    $el.attr('data-index', undefined);

    var sectionName = $.map($el.parentsUntil($selectionContainer, "div.section").get().reverse(), function(parentSection) {
      return Util.textOf($(parentSection).find("> div.title"));
    }).join(options.sectionDelimiter);

    return {
      text: text,
      value: value,
      initialIndex: initialIndex,
      sectionName: sectionName
    };
  }

  function updateOriginalSelect() {
    var selected = [];
    $selectedContainer.find("div.item").each(function() {
      selected.push($(this).attr('data-value'));
    });

    $originalSelect.val(selected).change();

    $originalSelect.html($originalSelect.find("option").sort(function(a, b) {
      var aValue = selected.indexOf($(a).attr('value'));
      var bValue = selected.indexOf($(b).attr('value'));

      if (aValue > bValue) return 1;
      if (aValue < bValue) return -1;
      return 0;
    }));
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

  Util.onCheckboxChange($selectionContainer, update);
}

function armRemoveSelectedOnClick($selectionContainer, $selectedContainer) {
  $selectedContainer.on("click", "span.remove-selected", function() {
    var value = $(this).parent().attr('data-value');
    var $matchingSelection = $selectionContainer.find("div.item[data-value='" + value + "']");
    var $matchingCheckbox = $matchingSelection.find("> input[type=checkbox]");
    $matchingCheckbox.prop('checked', false);
    $matchingCheckbox.change();
  });
}

module.exports = treeMultiselect;
