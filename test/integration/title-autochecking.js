QUnit.module("Title Autochecking", {
  beforeEach: function(assert) {
    var select = document.createElement("select");
    select.setAttribute("multiple", "multiple");
    $("div#qunit-fixture").append(select);
    assert.equal($("select").length, 1);
  }
});

QUnit.test("section checkboxes should be checked when all children are selected initially", function(assert) {
  $("select").append("<option value='one' data-section='foo' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo' selected='selected'>Two</option>");
  $("select").treeMultiselect();

  assert.equal($("input[type=checkbox]").length, 3, "there should be three checkboxes");
  assert.equal($("div.item > input[type=checkbox]").length, 2, "two checkboxes should be item checkboxes");
  assert.equal($("input[type=checkbox]:checked").length, 3, "all three should be checked");
});

QUnit.test("section checkboxes should be checked when all children are selected", function(assert) {
  $("select").append("<option value='one' data-section='foo' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo'>Two</option>");
  $("select").treeMultiselect();

  assert.equal($("input[type=checkbox]:checked").length, 1, "only one item should be checked");

  var lastItem = $("div.selections div.item").last();
  lastItem.find("> input[type=checkbox]").prop('checked', true).trigger('change');

  assert.equal($("input[type=checkbox]:checked").length, 3, "both items and the title should be checked");
});

QUnit.test("top level parent should not be checked if only one child section is completely checked", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo/baz'>Two</option>");
  $("select").treeMultiselect();

  var topLevel = $("div.section").first();
  assert.ok(!(topLevel.find("> div.title > input[type=checkbox]").is(":checked")), "top level parent should not checked");
});

QUnit.test("top level parent checking with only one child section completely checked, now with triggers", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo/bar'>Two</option>");
  $("select").append("<option value='three' data-section='foo/baz'>Three</option>");
  $("select").treeMultiselect();

  var topLevel = $("div.section").first();
  assert.ok(!(topLevel.find("> div.title > input[type=checkbox]").is(":checked")), "top level parent should not checked");

  var barSection = $("div.section").filter(function() {
    return textOf($(this).find("> div.title")) == 'bar';
  });
  assert.equal(barSection.length, 1, "should be on 'bar' section");
  assert.ok(!(barSection.find("> div.title > input[type=checkbox]").is(":checked")), "bar section is not checked yet");

  barSection.find("div.item > input[type=checkbox]").prop('checked', true).trigger('change');

  assert.ok(barSection.find("> div.title > input[type=checkbox]").is(":checked"), "bar section should be checked now");
  assert.ok(!(topLevel.find("> div.title > input[type=checkbox]").is(":checked")), "top level section should still not be checked");
});

QUnit.test("titles should unselect when a child is unselected", function(assert) {
  $("select").append("<option value='one' data-section='foo' selected='selected'>One</option>");
  $("select").treeMultiselect();

  assert.ok($("div.title > input[type=checkbox]").is(":checked"), "title should initially be checked");

  var item = $("div.item > input[type=checkbox]").first();
  item.prop("checked", false);
  item.trigger('change');

  assert.ok(!($("div.title > input[type=checkbox]").is(":checked")), "title should not be checked now");
});
