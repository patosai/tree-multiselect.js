module.exports = {
  onCheckboxChange($selectionContainer, callback) {
    $selectionContainer.on("change", "input[type=checkbox]", function(event) {
      callback.call(this, event);
    });
  },

  textOf(el) {
    return $(el).clone().children().remove().end().text();
  }
};
