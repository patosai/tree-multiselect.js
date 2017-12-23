function UiBuilder($el, hideSidePanel) {
  let $tree = jQuery('<div class="tree-multiselect"></div>');

  let $selections = jQuery('<div class="selections"></div>');
  if (hideSidePanel) {
    $selections.addClass('no-border');
  }
  $tree.append($selections);

  let $selected = jQuery('<div class="selected"></div>');
  if (!hideSidePanel) {
    $tree.append($selected);
  }

  this.$el = $el;
  this.$treeContainer = $tree;
  this.$selectionContainer = $selections;
  this.$selectedContainer = $selected;
}

UiBuilder.prototype.attach = function() {
  this.$el.after(this.$treeContainer);
};

UiBuilder.prototype.remove = function() {
  this.$treeContainer.remove();
};

module.exports = UiBuilder;
