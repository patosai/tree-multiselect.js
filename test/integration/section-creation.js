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
  assert.equal($("div.tree-multiselect").length, 1, "should only be one tree-multiselect element");
});

QUnit.test("creates the selections and selected containers", function(assert) {
  $("select").treeMultiselect();

  assert.equal($("div.selections").length, 1, "should create a selections element");
  assert.equal($("div.selected").length, 1, "should create a selected element");
});

QUnit.test("creates a section with title and items", function(assert) {
  $("select").append("<option data-section='section' value='item1'></option>");
  $("select").append("<option data-section='section' value='item2'></option>");
  $("select").append("<option data-section='section' value='item3'></option>");
  $("select").treeMultiselect();
  
  assert.equal($("div.selections > div.section").length, 1, "should create one section");

  var title = $("div.selections > div.section > div.title");
  assert.equal(title.length, 1, "should create one title");
  assert.equal(textOf(title), "section", "title is incorrect");

  var collapse = title.find("span.collapse-section");
  assert.equal(collapse.length, 1, "should create one collapse span");

  var checkbox = title.find("input[type=checkbox]");
  assert.equal(checkbox.length, 1, "should create a section title checkbox");

  var items = $("div.selections > div.section > div.item");
  assert.equal(items.length, 3, "should create three items in section");
  var itemTexts = ["item1", "item2", "item3"]
  items.each(function(index, item) {
    assert.equal($(item).text(), itemTexts[index], "item text is incorrect");
    assert.ok($(item).is(":visible"), "item should be visible by default");
  });
});

QUnit.test("can generate nested sections", function(assert) {
  $("select").append("<option value='ABC' data-section='alphabet/capitals'>ABC</option>");
  $("select").append("<option value='xyz' data-section='alphabet/lowercase'>xyz</option>");
  $("select").append("<option value='DEF' data-section='alphabet/capitals'>DEF</option>");
  $("select").append("<option value='Google' data-section='alphabet'>Google</option>");

  $("select").treeMultiselect();

  assert.equal($("div.section").length, 3, "there should be three sections");
  assert.equal($("div.section > div.section").length, 2, "there should be two sections inside the other");

  var outerSection = $("div.section").first();
  assert.equal(textOf(outerSection.find("> div.title")), "alphabet", "outer section name should be 'alphabet'");

  var outerItem = outerSection.find("> div.item");
  assert.equal(outerItem.length, 1, "there should be one outer item");
  assert.equal(outerItem.first().text(), "Google", "outer item should be Google");

  var innerSections = $("div.section").slice(1);
  var firstInnerSection = innerSections.first();
  var lastInnerSection = innerSections.last();
  assert.equal(textOf(firstInnerSection.find("> div.title")), "capitals", "one inner section name should be 'capitals'");
  assert.equal(textOf(lastInnerSection.find("> div.title")), "lowercase", "the other inner section name should be 'lowercase'");

  var capitalsItems = firstInnerSection.find("> div.item");
  assert.equal(capitalsItems.length, 2, "capitals should have two items");
  assert.equal(capitalsItems.first().text(), "ABC", "first item should be ABC");
  assert.equal(capitalsItems.last().text(), "DEF", "last item should be DEF");

  var lowercaseItems = lastInnerSection.find("> div.item");
  assert.equal(lowercaseItems.length, 1, "lowercase should have one item");
  assert.equal(lowercaseItems.first().text(), "xyz", "item should be xyz");
});

QUnit.test("selects options that were selected in original select", function(assert) {
  $("select").append("<option value='one' data-section='foo'>one</option>");
  $("select").append("<option value='two' data-section='foo'>two</option>");

  $("select").val(["one"]);

  $("select").treeMultiselect();

  var itemOne = $("div.item").filter(function() {
    return $(this).clone().children().remove().end().text() == 'one';
  });
  assert.ok(itemOne.find("> input[type=checkbox]").prop('checked'), "one should be checked");

  var itemTwo = $("div.item").filter(function() {
    return $(this).clone().children().remove().end().text() == 'two';
  });
  assert.ok(!itemTwo.find("> input[type=checkbox]").prop('checked'), "two should not be checked");
});

QUnit.test("respects the data-index attribute", function(assert) {
  $("select").append("<option value='one' data-section='foo' data-index='5' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo' data-index='3' selected='selected'>Two</option>");
  $("select").append("<option value='three' data-section='foo' data-index='7' selected='selected'>Three</option>");
  $("select").treeMultiselect();

  var selected = $("div.selected > div.item");
  assert.equal(selected.length, 3, "should be three selected items");
  var order = ["Two", "One", "Three"];

  selected.each(function(i, item) {
    assert.equal(textOf(item), order[i], "data-index puts items in the wrong order");
  });
});

QUnit.test("data-index works on nested elements", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar' data-index='5' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo' data-index='3' selected='selected'>Two</option>");
  $("select").append("<option value='three' data-section='foo/super/nested/element' data-index='7' selected='selected'>Three</option>");
  $("select").treeMultiselect();

  var selected = $("div.selected > div.item");
  assert.equal(selected.length, 3, "should be three selected items");
  var order = ["Two", "One", "Three"];

  selected.each(function(i, item) {
    assert.equal(textOf(item), order[i], "data-index puts nested items in the wrong order");
  });
});

QUnit.test("data-description gets put on selections", function(assert) {
  $("select").append("<option value='one' data-section='foo' data-description='foo-description'>Foo</option>");
  $("select").treeMultiselect();

  var item = $("div.selections div.item");
  assert.equal(item.length, 1, "should be one item");
  assert.equal(item.first().attr('data-description'), "foo-description", "item description is not put correctly on selection");
});

QUnit.test("section on selected items is displayed correctly", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar/baz' selected='selected'>One</option>");
  $("select").treeMultiselect();

  var sectionSpan = $("div.selected div.item span.selectedSectionName");
  assert.equal(sectionSpan.length, 1, "should be one section name span");
  assert.equal(textOf(sectionSpan), "foo/bar/baz", "selected item section name is incorrect");
});
