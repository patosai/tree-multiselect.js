var Tree = require('./tree');

var uniqueId = 0;

var treeMultiselect = function(opts) {
  var options = mergeDefaultOptions(opts);

  this.each(() => {
    var $originalSelect = this;
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
    searchable: false,
    searchParams: ['value', 'text', 'description', 'section'],
    sectionDelimiter: '/',
    showSectionOnSelected: true,
    sortable: false,
    startCollapsed: false
  };
  return jQuery.extend({}, defaults, options);
}

module.exports = treeMultiselect;
