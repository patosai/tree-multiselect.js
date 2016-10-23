module.exports = {
  onCheckboxChange($selectionContainer, callback) {
    $selectionContainer.on("change", "input[type=checkbox]", function(event) {
      callback.call(this, event);
    });
    callback();
  },

  textOf(el) {
    return $(el).clone().children().remove().end().text();
  }
};
