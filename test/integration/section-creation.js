QUnit.module("Section Creation", {
  beforeEach: function(assert) {
    var select = document.createElement("select");
    select.setAttribute("multiple", "multiple");
    $("div#qunit-fixture").append(select);
    assert.equal($("select").length, 1);
  }
});

QUnit.test("creates the base div.tree-multiselect element", function(assert) {
  $("select").treeMultiselect();
  assert.equal($("div.tree-multiselect").length, 1);
});

QUnit.test("creates the selections and selected containers", function(assert) {
  $("select").treeMultiselect();

  assert.equal($("div.selections").length, 1);
  assert.equal($("div.selected").length, 1);
});

QUnit.test("creates a section with title and items", function(assert) {
  $("select").append("<option data-section='section' value='item1'></option>");
  $("select").append("<option data-section='section' value='item2'></option>");
  $("select").append("<option data-section='section' value='item3'></option>");
  $("select").treeMultiselect();

  assert.equal($("div.selections > div.section").length, 1, "should create one section");

  var title = $("div.selections > div.section > div.title");
  assert.equal(title.length, 1);
  assert.equal(textOf(title), "section");

  var collapse = title.find("span.collapse-section");
  assert.equal(collapse.length, 1);

  var checkbox = title.find("input[type=checkbox]");
  assert.equal(checkbox.length, 1);

  var items = $("div.selections > div.section > div.item");
  assert.equal(items.length, 3);
  var itemTexts = ["item1", "item2", "item3"]
  items.each(function(index, item) {
    assert.equal($(item).text(), itemTexts[index]);
    assert.ok($(item).is(":visible"));
  });
});

QUnit.test("can generate nested sections", function(assert) {
  $("select").append("<option value='ABC' data-section='alphabet/capitals'>ABC</option>");
  $("select").append("<option value='xyz' data-section='alphabet/lowercase'>xyz</option>");
  $("select").append("<option value='DEF' data-section='alphabet/capitals'>DEF</option>");
  $("select").append("<option value='Google' data-section='alphabet'>Google</option>");

  $("select").treeMultiselect();

  assert.equal($("div.section").length, 3);
  assert.equal($("div.section > div.section").length, 2);

  var outerSection = $("div.section").first();
  assert.equal(textOf(outerSection.find("> div.title")), "alphabet");

  var outerItem = outerSection.find("> div.item");
  assert.equal(outerItem.length, 1);
  assert.equal(outerItem.first().text(), "Google");

  var innerSections = $("div.section").slice(1);
  var firstInnerSection = innerSections.first();
  var lastInnerSection = innerSections.last();
  assert.equal(textOf(firstInnerSection.find("> div.title")), "capitals");
  assert.equal(textOf(lastInnerSection.find("> div.title")), "lowercase");

  var capitalsItems = firstInnerSection.find("> div.item");
  assert.equal(capitalsItems.length, 2);
  assert.equal(capitalsItems.first().text(), "ABC");
  assert.equal(capitalsItems.last().text(), "DEF");

  var lowercaseItems = lastInnerSection.find("> div.item");
  assert.equal(lowercaseItems.length, 1);
  assert.equal(lowercaseItems.first().text(), "xyz");
});

QUnit.test("selects options that were selected in original select", function(assert) {
  $("select").append("<option value='one' data-section='foo'>one</option>");
  $("select").append("<option value='two' data-section='foo'>two</option>");

  $("select").val(["one"]);

  $("select").treeMultiselect();

  var itemOne = $("div.item").filter(function() {
    return $(this).clone().children().remove().end().text() == 'one';
  });
  assert.ok(itemOne.find("> input[type=checkbox]").prop('checked'));

  var itemTwo = $("div.item").filter(function() {
    return $(this).clone().children().remove().end().text() == 'two';
  });
  assert.ok(!itemTwo.find("> input[type=checkbox]").prop('checked'));
});

QUnit.test("respects the data-index attribute", function(assert) {
  $("select").append("<option value='one' data-section='foo' data-index='5' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo' data-index='3' selected='selected'>Two</option>");
  $("select").append("<option value='three' data-section='foo' data-index='7' selected='selected'>Three</option>");
  $("select").treeMultiselect();

  var selected = $("div.selected > div.item");
  assert.equal(selected.length, 3);
  var order = ["Two", "One", "Three"];

  selected.each(function(i, item) {
    assert.equal(textOf(item), order[i]);
  });
});

QUnit.test("data-index works on nested elements", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar' data-index='5' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo' data-index='3' selected='selected'>Two</option>");
  $("select").append("<option value='three' data-section='foo/super/nested/element' data-index='7' selected='selected'>Three</option>");
  $("select").treeMultiselect();

  var selected = $("div.selected > div.item");
  assert.equal(selected.length, 3);
  var order = ["Two", "One", "Three"];

  selected.each(function(i, item) {
    assert.equal(textOf(item), order[i]);
  });
});

QUnit.test("data-description gets put on selections", function(assert) {
  $("select").append("<option value='one' data-section='foo' data-description='foo-description'>Foo</option>");
  $("select").treeMultiselect();

  var item = $("div.selections div.item");
  assert.equal(item.length, 1, "should be one item");
  assert.equal(item.first().attr('data-description'), "foo-description");
});

QUnit.test("section on selected items is displayed correctly", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar/baz' selected='selected'>One</option>");
  $("select").treeMultiselect();

  var sectionSpan = $("div.selected div.item span.section-name");
  assert.equal(sectionSpan.length, 1);
  assert.equal(textOf(sectionSpan), "foo/bar/baz");
});

QUnit.test("handles undefined data-section input", function(assert) {
  $("select").append("<option value='one' data-section selected='selected'>One</option>");
  $("select").treeMultiselect();

  assert.equal($("div.selections div.item").length, 1);

  var parentSection = $("div.selections div.section");
  assert.equal(textOf(parentSection.find("> div.title")), "");
});

QUnit.test("blows up if no data-section is provided at all", function(assert) {
  $("select").append("<option value='one' selected='selected'>One</option>");

  assert.throws(function() {
    $("select").treeMultiselect();
  });
});

QUnit.test("can handle multi-digit data-index", function(assert) {
  $("select").append("<option value='one' data-section='' data-index='10' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='' data-index='2' selected='selected'>Two</option>");
  $("select").treeMultiselect();

  var items = $("div.selected div.item");
  assert.equal(textOf(items.first()), 'Two');
  assert.equal(textOf(items.last()), 'One');
});
