module.exports = function($el, hideSidePanel) {
  var $tree = $("<div class='tree-multiselect'></div>");

  var $selections = $("<div class='selections'></div>");
  if (hideSidePanel) {
    $selections.addClass("no-border");
  }
  $tree.append($selections);

  var $selected = $("<div class='selected'></div>");
  if (!hideSidePanel) {
    $tree.append($selected);
  }

  $el.after($tree);

  this.$tree = $tree;
  this.$selectionContainer = $selections;
  this.$selectedContainer = $selected;
};
