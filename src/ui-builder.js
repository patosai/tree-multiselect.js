module.exports = function($el, hideSidePanel) {
  var tree = document.createElement('div');
  tree.className = "tree-multiselect";
  $el.after(tree);

  var selections = document.createElement('div');
  selections.className = "selections";
  if (hideSidePanel) {
    selections.className += " no-border";
  }
  $(tree).append(selections);

  var selected = document.createElement('div');
  selected.className = "selected";
  if (!hideSidePanel) {
    $(tree).append(selected);
  }

  this.tree = tree;
  this.selections = selections;
  this.selected = selected;
};
