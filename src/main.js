let Tree = require('./tree');

let uniqueId = 0;

let treeMultiselect = function(opts) {
  let options = mergeDefaultOptions(opts);

  return this.map(() => {
    let $originalSelect = this;
    $originalSelect.attr('multiple', '').css('display', 'none');

    let tree = new Tree(uniqueId, $originalSelect, options);
    tree.initialize();

    ++uniqueId;

    return {
      reload: function() {
        tree.reload();
      },

      remove: function() {
        tree.remove();
      }
    };
  });
};

function mergeDefaultOptions(options) {
  let defaults = {
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
