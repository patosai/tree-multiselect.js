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
  assert.equal(textOf(selectedItem.find("> span.selectedSectionName")), 'section', "selected item section label should be 'section'");
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
