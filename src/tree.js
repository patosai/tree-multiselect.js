var Option = require('./option');
var Util = require('./utility');

function Tree($originalSelect, $selectionContainer, $selectedContainer, options) {
  this.$originalSelect = $originalSelect;
  this.$selectionContainer = $selectionContainer;
  this.$selectedContainer = $selectedContainer;
  this.options = options;

  this.selectOptions = [];
  this.selectedKeys = [];
  this.keysToAdd = [];
  this.keysToRemove = [];
}

Tree.prototype.initialize = function() {
  var data = this.generateSelections();
  var generatedHtmlData = this.generateHtmlFromData(data);
  this.$selectionContainer.append(generatedHtmlData);

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

Tree.prototype.generateSelections = function() {
  // nested objects and arrays
  // [ [options directly under this section], {nested sections}]
  var data = [[], {}];

  var sectionDelimiter = this.options.sectionDelimiter;

  var self = this;
  var id = 0;
  var keysToAddAtEnd = [];
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
    var optionIndex = optionIndexItem ? parseInt(optionIndexItem.value) : null;
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
  this.keysToAdd = Util.arrayUniq(Util.arrayRemoveFalseyExceptZero(this.keysToAdd).concat(keysToAddAtEnd));

  return data;
};

Tree.prototype.generateHtmlFromData = function(data) {
  // returns array, 0th el is number of options, 1st el is HTML string
  var str = "";
  for (var ii = 0; ii < data[0].length; ++ii) {
    var option = data[0][ii];

    var optionLabelCheckboxId = `treemultiselect-${option.id}`;
    var descriptionStr = option.description ? ` data-description='${option.description}'` : "";
    var indexStr = option.initialIndex ? ` data-index='${option.initialIndex}'` : "";
    var optionCheckboxStr = "";
    var optionLabelStr = "";
    if (!this.options.onlyBatchSelection) {
      optionCheckboxStr += `<input class='option' type='checkbox' id='${optionLabelCheckboxId}'`;
      if (this.options.freeze) {
        optionCheckboxStr += " disabled";
      }
      optionCheckboxStr += "/>";
      optionLabelStr += `<label for='${optionLabelCheckboxId}'>${option.text || option.value}</label>`;
    } else {
      optionLabelStr += `${option.text || option.value}`;
    }
    var descriptionPopupStr = option.description ? "<span class='description'>?</span>" : "";

    str += `<div class='item' data-key='${option.id}'data-value='${option.value}'${descriptionStr}${indexStr}>${optionCheckboxStr}${descriptionPopupStr}${optionLabelStr}</div>`;
  }

  var keys = Object.keys(data[1]);
  for (var jj = 0; jj < keys.length; ++jj) {
    var sectionCheckboxStr = "";
    if (this.options.onlyBatchSelection || this.options.allowBatchSelection) {
      sectionCheckboxStr += "<input class='section' type='checkbox'";
      if (this.options.freeze) {
        sectionCheckboxStr += " disabled";
      }
      sectionCheckboxStr += "/>";
    }

    var generatedData = this.generateHtmlFromData(data[1][keys[jj]]);
    str += `<div class='section'><div class='title'>${sectionCheckboxStr}${keys[jj]}</div>${generatedData}</div>`;
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

Tree.prototype.handleSectionCheckboxMarkings = function() {
  var self = this;
  this.$selectionContainer.on("change", "input.section[type=checkbox]", function() {
    var $section = $(this).closest("div.section");
    var $items = $section.find("div.item");
    var keys = [];
    $items.each((idx, el) => {
      keys.push(Util.getKey(el));
    });
    if (this.checked) {
      self.keysToAdd = Util.arrayUniq(self.keysToAdd.concat(keys));
    } else {
      self.keysToRemove = Util.arrayUniq(self.keysToRemove.concat(keys));
    }
    self.render();
  });
};

Tree.prototype.redrawSectionCheckboxes = function($section) {
  $section = $section || this.$selectionContainer;

  // returns array; 0th el is all children are true, 1st el is all children are false
  var returnVal = [true, true];
  var $childCheckboxes = $section.find("> div.item > input[type=checkbox]");
  $childCheckboxes.each(function() {
    if (this.checked) {
      returnVal[1] = false;
    } else {
      returnVal[0] = false;
    }
  });

  var self = this;
  var $childSections = $section.find("> div.section");
  $childSections.each(function() {
    var result = self.redrawSectionCheckboxes($(this));
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

  this.$selectionContainer.prepend($selectAllContainer);

  var self = this;
  this.$selectionContainer.on("click", "span.select-all", function() {
    for (var ii = 0; ii < self.selectOptions.length; ++ii) {
      self.keysToAdd.push(ii);
    }
    self.keysToAdd = Util.arrayUniq(self.keysToAdd);
    self.render();
  });

  this.$selectionContainer.on("click", "span.unselect-all", function() {
    self.keysToRemove = Util.arrayUniq(self.keysToRemove.concat(self.selectedKeys));
    self.render();
  });
};

Tree.prototype.armRemoveSelectedOnClick = function() {
  var self = this;
  this.$selectedContainer.on("click", "span.remove-selected", function() {
    var parentNode = this.parentNode;
    var key = Util.getKey(parentNode);
    self.keysToRemove.push(key);
    self.render();
  });
};


Tree.prototype.updateSelectedAndOnChange = function() {
  var self = this;
  this.$selectionContainer.on("change", "input.option[type=checkbox]", function(event) {
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
      start: function(event, ui) {
        startIndex = ui.item.index();
      },

      stop: function(event, ui) {
        endIndex = ui.item.index();
        if (startIndex === endIndex) {
          return;
        }
        Util.arrayMoveEl(self.selectedKeys, startIndex, endIndex);
        self.render();
      }
    });
  }
};

Tree.prototype.render = function(noCallbacks) {
  // fix arrays first
  this.keysToAdd = Util.arraySubtract(this.keysToAdd, this.selectedKeys);
  this.keysToRemove = Util.arrayIntersect(this.keysToRemove, this.selectedKeys);

  // remove items first
  var self = this;
  var $selectionItems = this.$selectionContainer.find("div.item");

  // remove the selected divs
  this.$selectedContainer.find("div.item").filter(function() {
    var key = Util.getKey(this);
    return self.keysToRemove.indexOf(key) !== -1;
  }).remove();

  // uncheck these checkboxes
  $selectionItems.filter(function() {
    var key = Util.getKey(this);
    return self.keysToRemove.indexOf(key) !== -1;
  }).find("> input[type=checkbox]").prop('checked', false);

  this.selectedKeys = Util.arraySubtract(this.selectedKeys, this.keysToRemove);

  // now add items
  var domStr = "";
  for (var jj = 0; jj < this.keysToAdd.length; ++jj) {
    var key = this.keysToAdd[jj];
    var option = this.selectOptions[key];
    this.selectedKeys.push(key);

    var freezeStr = this.options.freeze ? '' : "<span class='remove-selected'>×</span>";
    var sectionNameStr = this.options.showSectionOnSelected ? `<span class='section-name'>${option.section}</span>` : '';
    domStr += `<div class='item' data-key='${option.id}' data-value='${option.value}'>${freezeStr}${sectionNameStr}${option.text}</div>`;
  }
  this.$selectedContainer.append(domStr);

  // check the checkboxes
  $selectionItems.filter(function() {
    var key = Util.getKey(this);
    return self.keysToAdd.indexOf(key) !== -1;
  }).find("> input[type=checkbox]").prop('checked', true);

  this.selectedKeys = Util.arrayUniq(this.selectedKeys.concat(this.keysToAdd));

  // redraw section checkboxes
  this.redrawSectionCheckboxes();

  // now fix original select
  var vals = [];
  // valHash hashes a value to an index
  var valHash = {};
  for (var ii = 0; ii < this.selectedKeys.length; ++ii) {
    var value = this.selectOptions[this.selectedKeys[ii]].value;
    vals.push(value);
    valHash[value] = ii;
  }
  // TODO is there a better way to sort the values other than by HTML?
  var options = this.$originalSelect.find("option").toArray();
  options.sort(function(a, b) {
    var aValue = valHash[a.value] || 0;
    var bValue = valHash[b.value] || 0;
    return aValue - bValue;
  });

  this.$originalSelect.html(options);
  this.$originalSelect.val(vals).change();

  if (!noCallbacks && this.options.onChange) {
    var optionsSelected = this.selectedKeys.map((key) => {
      return this.selectOptions[key];
    });
    var optionsAdded = this.keysToAdd.map((key) => {
      return this.selectOptions[key];
    });
    var optionsRemoved = this.keysToRemove.map((key) => {
      return this.selectOptions[key];
    });
    this.options.onChange(optionsSelected, optionsAdded, optionsRemoved);
  }

  this.keysToRemove = [];
  this.keysToAdd = [];
};

module.exports = Tree;
