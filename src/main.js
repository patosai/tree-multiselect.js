var Option = require('./option');
var Tree = require('./tree');
var UiBuilder = require('./ui-builder');
var Util = require('./utility');

var treeMultiselect = function(opts) {
  var options = mergeDefaultOptions(opts);
  this.each(() => {
    var $originalSelect = $(this);
    $originalSelect.attr('multiple', '').css('display', 'none');

    var uiBuilder = new UiBuilder($originalSelect, options.hideSidePanel);

    var $selectionContainer = uiBuilder.$selectionContainer;
    var $selectedContainer = uiBuilder.$selectedContainer;
    //updateSelectedAndOnChange($selectionContainer, $selectedContainer, $originalSelect, options);

    var tree = new Tree($originalSelect, uiBuilder.$selectionContainer, uiBuilder.$selectedContainer, options);
    tree.initialize();

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

module.exports = treeMultiselect;
