QUnit.module("Adding and Removing", {
  beforeEach: function(assert) {
    var select = document.createElement("select");
    select.setAttribute("multiple", "multiple");
    $("div#qunit-fixture").append(select);
    assert.equal($("select").length, 1);
  }
});

QUnit.test("can add an item", function(assert) {
  $("select").append("<option value='one' data-section='section'>One</option>");
  $("select").treeMultiselect();

  assert.equal($("div.selections div.item").length, 1, "there should be one item for selection");
  assert.equal($("div.selected div.item").length, 0, "no items should be selected");

  $("div.selections div.item > input[type=checkbox]").prop('checked', true).trigger('change');

  assert.equal($("div.selections div.item > input[type=checkbox]:checked").length, 1, "the one item should be checked");
  var selectedItem = $("div.selected div.item");
  assert.equal($("div.selected div.item").length, 1, "there should be one item in the selected div");

  assert.equal(textOf(selectedItem), 'One', "selected item text should be 'one'");
  assert.equal(textOf(selectedItem.find("> span.section-name")), 'section', "selected item section label should be 'section'");
});

QUnit.test("can add an item with the same text", function(assert) {
  $("select").append("<option value='one' data-section='section'>One</option>");
  $("select").append("<option value='one_more' data-section='section1'>One</option>");
  $("select").treeMultiselect();

  assert.equal($("div.selections div.item").length, 2, "there should be two items for selection");
  assert.equal($("div.selected div.item").length, 0, "no items should be selected");

  $("div.selections div.item > input[type=checkbox]:first").prop('checked', true).trigger('change');
  $("div.selections div.item > input[type=checkbox]:last").prop('checked', true).trigger('change');

  assert.equal($("div.selections div.item > input[type=checkbox]:checked").length, 2, "two items should be checked");
  var selectedItem = $("div.selected div.item");
  assert.equal($("div.selected div.item").length, 2, "there should be two items in the selected div");

  assert.equal(textOf(selectedItem.first()), 'One', "first selected item text should be 'One'");
  assert.equal(textOf(selectedItem.last()), 'One', "second selected item text should be 'One'");
  assert.equal(textOf(selectedItem.first().find("> span.section-name")), 'section', "first selected item section label should be 'section'");
  assert.equal(textOf(selectedItem.last().find("> span.section-name")), 'section1', "second selected item section label should be 'section'");
});

QUnit.test("can remove an item", function(assert) {
  $("select").append("<option value='one' data-section='section' selected='selected'>One</option>");
  $("select").treeMultiselect();

  var selectedItem = $("div.selected div.item");
  assert.equal(selectedItem.length, 1, "there should be one selected item");

  var removeSpan = selectedItem.find("> span.remove-selected");
  removeSpan.trigger('click');

  assert.equal($("div.selected div.item").length, 0, "there should now be no selected items");
});

QUnit.test("removing an item does not remove any others", function(assert) {
  $("select").append("<option value='one' data-section='A' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='A' selected='selected'>Two</option>");
  $("select").append("<option value='three' data-section='A/B' selected='selected'>Three</option>");
  $("select").append("<option value='four' data-section='A/B' selected='selected'>Four</option>");
  $("select").append("<option value='five' data-section='another section' selected='selected'>Five</option>");
  $("select").treeMultiselect();

  assert.equal($("div.selected div.item").length, 5, "all five items should be selected");

  var thirdItem = $("div.selected div.item").filter(function() {
    return textOf($(this)) == 'Three';
  });

  thirdItem.find("span.remove-selected").trigger('click');

  assert.equal($("div.selected div.item").length, 4, "now only four items should be selected");

  var itemWithLabelThree = $("div.selected div.item").filter(function() {
    return textOf($(this)) == 'Three';
  });
  assert.equal(itemWithLabelThree.length, 0, "the element should be gone now");
});
