var Option = require('./option');
var Util = require('./utility');

function Tree($originalSelect, $selectionContainer, $selectedContainer, options) {
  this.$originalSelect = $originalSelect;
  this.$selectionContainer = $selectionContainer;
  this.$selectedContainer = $selectedContainer;
  this.options = options;

  this.selectOptions = [];
  this.selectedVals = [];
}

Tree.prototype.initialize = function() {
  var data = this.generateSelections();
  var generatedHtmlData = this.generateHtmlFromData(data);
  Util.assert(this.selectOptions.length == generatedHtmlData[0]);
  this.$selectionContainer.append(generatedHtmlData[1]);

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

  this.checkPreselectedSelections();
};

Tree.prototype.generateSelections = function() {
  // nested objects and arrays
  // [ [options directly under this section], {nested sections}]
  var data = [[], {}];

  var sectionDelimiter = this.options.sectionDelimiter;

  this.$originalSelect.find("> option").each(function() {
    var option = this;
    var attributes = option.attributes;
    var sectionItem = attributes.getNamedItem("data-section");
    var section = sectionItem ? sectionItem.value : null;
    var path = (section && section.length > 0) ? section.split(sectionDelimiter) : [];

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

  return data;
};

Tree.prototype.generateHtmlFromData = function(data, startingIndex) {
  // returns array, 0th el is number of options, 1st el is HTML string
  startingIndex  = startingIndex || 0;
  var keyIndex = startingIndex;
  var str = "";
  for (var ii = 0; ii < data[0].length; ++ii) {
    var option = data[0][ii];

    var descriptionStr = option.description ? ` data-description='${option.description}'` : "";
    var indexStr = option.index ? ` data-index='${option.index}'` : "";
    var optionCheckboxStr = "";
    if (!this.options.onlyBatchSelection) {
      optionCheckboxStr += "<input type='checkbox'";
      if (this.options.freeze) {
        optionCheckboxStr += " disabled";
      }
      optionCheckboxStr += "/>";
    }
    var descriptionPopupStr = option.description ? "<span class='description'>?</span>" : "";

    str += `<div class='item' data-key='${keyIndex}'data-value='${option.value}'${descriptionStr}${indexStr}>${optionCheckboxStr}${descriptionPopupStr}${(option.text || option.value)}</div>`;
    this.selectOptions.push(option);
    ++keyIndex;
  }

  var keys = Object.keys(data[1]);
  for (var jj = 0; jj < keys.length; ++jj) {
    var sectionCheckboxStr = "";
    if (this.options.onlyBatchSelection || this.options.allowBatchSelection) {
      sectionCheckboxStr += "<input type='checkbox'";
      if (this.options.freeze) {
        sectionCheckboxStr += " disabled";
      }
      sectionCheckboxStr += "/>";
    }

    var generatedData = this.generateHtmlFromData(data[1][keys[jj]], keyIndex);
    keyIndex += generatedData[0];
    str += `<div class='section'><div class='title'>${sectionCheckboxStr}${keys[jj]}</div>${generatedData[1]}</div>`;
  }
  return [keyIndex - startingIndex, str];
};

Tree.prototype.popupDescriptionHover = function() {
  this.$selectionContainer.on("mouseenter", "div.item > span.description", function() {
    var $item = $(this).parent();
    var description = $item.attr('data-description');

    var descriptionDiv = document.createElement('div');
    descriptionDiv.className = "temp-description-popup";
    descriptionDiv.innerHTML = description;

    descriptionDiv.style.position = 'absolute';

    $item.append(descriptionDiv);
  });

  this.$selectionContainer.on("mouseleave", "div.item > span.description", function() {
    var $item = $(this).parent();
    $item.find("div.temp-description-popup").remove();
  });
};

Tree.prototype.checkPreselectedSelections = function() {
  var selectedOptions = this.$originalSelect.val();
  if (!selectedOptions) return;

  var $selectedOptionDivs = this.$selectionContainer.find("div.item").filter(function() {
    var item = $(this);
    return selectedOptions.indexOf(item.attr('data-value')) !== -1;
  });
  $selectedOptionDivs.find("> input[type=checkbox]").prop('checked', true).change();
};

Tree.prototype.handleSectionCheckboxMarkings = function() {
  var self = this;
  this.$selectionContainer.on("change", "input[type=checkbox]", function() {
    var $checkboxParent = $(this).parent("div.title");
    if ($checkboxParent.length) {
      var $section = $checkboxParent.closest("div.section");
      $section.find("input[type=checkbox]").prop('checked', this.checked);
    } else {
      self.handleSectionCheckboxesOnOptionClick(self.$selectionContainer);
    }
  });
};

Tree.prototype.handleSectionCheckboxesOnOptionClick = function($section) {
  // returns array; 0th el is all children are true, 1st el is all children are false
  var self = this;
  var returnVal = [true, true];
  var $childCheckboxes = $section.find("> div.item > input[type=checkbox]");
  $childCheckboxes.each(function() {
    if (this.checked) {
      returnVal[1] = false;
    } else {
      returnVal[0] = false;
    }
  });

  var $childSections = $section.find("> div.section");
  $childSections.each(function() {
    var result = self.handleSectionCheckboxesOnOptionClick($(this));
    returnVal[0] = returnVal[0] && result[0];
    returnVal[1] = returnVal[1] && result[1];
  });

  var sectionCheckbox = $section.find("> div.title > input[type=checkbox]");
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

Tree.prototype.addCollapsibility = function() {
  var hideIndicator = "-";
  var expandIndicator = "+";

  var titleSelector = "div.title";
  var $titleDivs = this.$selectionContainer.find(titleSelector);

  var collapseDiv = document.createElement('span');
  collapseDiv.className = "collapse-section";
  if (this.options.startCollapsed) {
    $(collapseDiv).text(expandIndicator);
    $titleDivs.siblings().toggle();
  } else {
    $(collapseDiv).text(hideIndicator);
  }
  $titleDivs.prepend(collapseDiv);

  this.$selectionContainer.on("click", titleSelector, function(event) {
    if (event.target.nodeName == "INPUT") {
      return;
    }

    var $collapseSection = $(this).find("> span.collapse-section");
    var indicator = $collapseSection.text();
    $collapseSection.text(indicator ==  hideIndicator ? expandIndicator : hideIndicator);
    var $title = $collapseSection.parent();
    $title.siblings().toggle();
  });
};

Tree.prototype.createSelectAllButtons = function() {
  var $selectAll = $("<span class='select-all'></span>");
  $selectAll.text(this.options.selectAllText);
  var $unselectAll = $("<span class='unselect-all'></span>");
  $unselectAll.text(this.options.unselectAllText);

  var $selectAllContainer = $("<div class='select-all-container'></div>");

  $selectAllContainer.prepend($unselectAll);
  $selectAllContainer.prepend($selectAll);

  var self = this;

  this.$selectionContainer.prepend($selectAllContainer);

  this.$selectionContainer.on("click", "span.select-all", function() {
    var $checkboxes = self.$selectionContainer.find("input[type=checkbox]");
    $checkboxes.prop('checked', true).change();
  });

  this.$selectionContainer.on("click", "span.unselect-all", function() {
    var $checkboxes = self.$selectionContainer.find("input[type=checkbox]");
    $checkboxes.prop('checked', false).change();
  });
};

Tree.prototype.armRemoveSelectedOnClick = function() {
  var self = this;
  this.$selectedContainer.on("click", "span.remove-selected", function() {
    var parentNode = this.parentNode;
    var value = parentNode.attributes.getNamedItem('data-value').value;
    var $matchingSelection = self.$selectionContainer.find("div.item[data-value='" + value + "']");
    var $matchingCheckbox = $matchingSelection.find("> input[type=checkbox]");
    $matchingCheckbox.prop('checked', false).change();
  });
};


Tree.prototype.updateSelectedAndOnChange = function() {
  var $selectionContainer = this.$selectionContainer;
  var $selectedContainer = this.$selectedContainer;
  var $originalSelect = this.$originalSelect;
  var options = this.options;

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
};

module.exports = Tree;
