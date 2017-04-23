function UiBuilder($el, hideSidePanel) {
  var $tree = jQuery('<div class="tree-multiselect"></div>');

  var $selections = jQuery('<div class="selections"></div>');
  if (hideSidePanel) {
    $selections.addClass('no-border');
  }
  $tree.append($selections);

  var $selected = jQuery('<div class="selected"></div>');
  if (!hideSidePanel) {
    $tree.append($selected);
  }

  this.$el = $el;
  this.$tree = $tree;
  this.$selectionContainer = $selections;
  this.$selectedContainer = $selected;
}

UiBuilder.prototype.attach = function() {
  this.$el.after(this.$tree);
};

module.exports = UiBuilder;
