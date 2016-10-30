chai.config.includeStack = true;

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
  assertSelection(el, params) {
    var $el = $(el);
    assert($el.hasClass('item'));
    assert.equal(this.textOf($el), params.text);
    assert.equal($el.attr('data-value'), params.value);
  },

  assertSelected(el, params) {
    var $el = $(el);
    assert($el.hasClass('item'));
    assert.equal(this.textOf($el), params.text);
    assert.equal($el.attr('data-value'), params.value);
    var $sectionName = $el.children(".section-name");
    assert.equal($sectionName.length, 1);
    assert.equal(this.textOf($sectionName), params.section);
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

  // DOM element finders
  find(container, options) {
    var text = null;
    var value = null;

    if (options) {
      text = options.text;
      value = options.value;
    }

    var selector = container + (value ? `[data-value=${value}]` : '');
    var $els = $(selector);

    if (text) {
      $els = $els.filter((idx, el) => {
        return this.textOf(el) === text;
      });
    }

    return $els;
  },

  findCheckbox(container, options) {
    var $els = this.find(container, options).children("input[type=checkbox]");
    if (options && options.checked) {
      $els = $els.filter((idx, el) => {
        return el.checked === options.checked;
      });
    }
    return $els;
  },

  selection(options) {
    return this.find('.selections .item', options);
  },

  selected(options) {
    return this.find('.selected .item', options);
  },

  section(options) {
    // need to search title text, then go back up to section
    return this.find('.selections .section > .title', options).parent();
  },

  selectionCheckbox(options) {
    return this.findCheckbox(".selections .item", options);
  },

  sectionCheckbox(options) {
    return this.findCheckbox(".selections .section > .title", options);
  },

  sectionTitle(section) {
    return this.textOf($(section).children("div.title"));
  }
};

