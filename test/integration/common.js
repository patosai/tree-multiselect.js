beforeEach(() => {
  var $fixture = $("#fixture");
  if (!$fixture.length) {
    $fixture = $("<div id='fixture'></div>");
    $("body").append($fixture);
  }

  $fixture.empty();

  var select = document.createElement("select");
  select.setAttribute("multiple", "multiple");
  $fixture.append(select);
});

module.exports = {
  attributeOf(el, key) {
    return $(el).attr(key);
  },

  getSelections() {
    return $("div.selections div.item");
  },

  getSelected() {
    return $("div.selected div.item");
  },

  getSections() {
    return $("div.section");
  },

  getSelectionsWithText(text) {
    return this.getSelections().filter((idx, el) => {
      return this.textOf(el) === text;
    });
  },

  getSelectedWithText(text) {
    return this.getSelected().filter((idx, el) => {
      return this.textOf(el) === text;
    })
  },

  getSectionsWithTitle(title) {
    return this.getSections().filter((idx, el) => {
      return this.textOf($(el).children("div.title")) === title;
    });
  },

  textOf(el) {
    var $el = $(el);
    var $label = $el.children("label");
    if ($label.length) {
      return $label.first().text();
    } else {
      return $el.clone().children().remove().end().text();
    }
  },

  assertSelectionItem(el, params) {
    var $el = $(el);
    assert($el.hasClass('item'));
    assert.equal(this.textOf($el), params.text);
    assert.equal($el.attr('data-value'), params.value);
  },

  assertSelectedItem(el, params) {
    var $el = $(el);
    assert($el.hasClass('item'));
    assert.equal(this.textOf($el), params.text);
    assert.equal($el.attr('data-value'), params.value);
    var $sectionName = $el.children(".section-name");
    assert.equal($sectionName.length, 1);
    assert.equal(this.textOf($sectionName), params.section);
  }
};

