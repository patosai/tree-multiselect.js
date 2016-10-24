var Option = require('./option');
var Util = require('./utility');

function Tree($originalSelect, $selectionContainer, $selectedContainer, options) {
  this.$originalSelect = $originalSelect;
  this.$selectionContainer = $selectionContainer;
  this.$selectedContainer = $selectedContainer;
  this.options = options;
}

Tree.prototype.initialize = function() {
  var data = this.generateSelections();
  var html = this.generateHtmlFromData(data);
  this.$selectionContainer.append(html);

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

  this.checkPreselectedSelections();
  this.armRemoveSelectedOnClick();
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

Tree.prototype.generateHtmlFromData = function(data) {
  var str = "";
  var option = null;
  for (var ii = 0; ii < data[0].length; ++ii) {
    option = data[0][ii];

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

    str += `<div class='item' data-value='${option.value}'${descriptionStr}${indexStr}>${optionCheckboxStr}${descriptionPopupStr}${(option.text || option.value)}</div>`;
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

    str += `<div class='section'><div class='title'>${sectionCheckboxStr}${keys[jj]}</div>${this.generateHtmlFromData(data[1][keys[jj]])}</div>`;
  }
  return str;
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

module.exports = Tree;
