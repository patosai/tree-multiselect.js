module.exports = {
  onCheckboxChange($selectionContainer, callback) {
    $selectionContainer.on("change", "input[type=checkbox]", function() {
      callback();
    });
    callback();
  },

  textOf(el) {
    return $(el).clone().children().remove().end().text();
  }
};
