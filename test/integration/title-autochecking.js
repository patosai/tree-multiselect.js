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

  assert.equal($("input[type=checkbox]").length, 3);
  assert.equal($("div.item > input[type=checkbox]").length, 2);
  assert.equal($("input[type=checkbox]:checked").length, 3);
});

QUnit.test("section checkboxes should be checked when all children are selected", function(assert) {
  $("select").append("<option value='one' data-section='foo' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo'>Two</option>");
  $("select").treeMultiselect();

  assert.equal($("input[type=checkbox]:checked").length, 1);

  var lastItem = $("div.selections div.item").last();
  lastItem.find("> input[type=checkbox]").prop('checked', true).trigger('change');

  assert.equal($("input[type=checkbox]:checked").length, 3);
});

QUnit.test("top level parent should not be checked if only one child section is completely checked", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo/baz'>Two</option>");
  $("select").treeMultiselect();

  var topLevel = $("div.section").first();
  assert.ok(!(topLevel.find("> div.title > input[type=checkbox]").is(":checked")));
});

QUnit.test("top level parent checking with only one child section completely checked, now with triggers", function(assert) {
  $("select").append("<option value='one' data-section='foo/bar' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='foo/bar'>Two</option>");
  $("select").append("<option value='three' data-section='foo/baz'>Three</option>");
  $("select").treeMultiselect();

  var topLevel = $("div.section").first();
  assert.ok(!(topLevel.find("> div.title > input[type=checkbox]").is(":checked")));

  var barSection = $("div.section").filter(function() {
    return textOf($(this).find("> div.title")) == 'bar';
  });
  assert.equal(barSection.length, 1);
  assert.ok(!(barSection.find("> div.title > input[type=checkbox]").is(":checked")));

  barSection.find("div.item > input[type=checkbox]").prop('checked', true).trigger('change');

  assert.ok(barSection.find("> div.title > input[type=checkbox]").is(":checked"));
  assert.ok(!(topLevel.find("> div.title > input[type=checkbox]").is(":checked")));
});

QUnit.test("titles should unselect when a child is unselected", function(assert) {
  $("select").append("<option value='one' data-section='foo' selected='selected'>One</option>");
  $("select").treeMultiselect();

  assert.ok($("div.title > input[type=checkbox]").is(":checked"));

  var item = $("div.item > input[type=checkbox]").first();
  item.prop("checked", false);
  item.trigger('change');

  assert.ok(!($("div.title > input[type=checkbox]").is(":checked")));
});

QUnit.test("nested titles should all be checked if a title is batch selected", function(assert) {
  $("select").append("<option value='one' data-section='top/middle/inner'>One</option>");
  $("select").treeMultiselect();

  assert.equal($("input[type=checkbox]").length, 4);
  assert.equal($("input[type=checkbox]:checked").length, 0);

  var middleSection = $("div.section").filter(function() {
    return textOf($(this).find("> div.title")) == 'middle';
  });

  middleSection.find("> div.title > input[type=checkbox]").prop('checked', true).trigger('change');

  assert.equal($("input[type=checkbox]:checked").length, 4);
});

QUnit.test("title checkbox is indeterminate when some but not all options are selected", function(assert) {
  $("select").append("<option value='one' data-section='top'>One</option>");
  $("select").append("<option value='two' data-section='top' selected='selected'>Two</option>");
  $("select").treeMultiselect();

  var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  assert.equal(titleCheckbox.length, 1);
  assert.ok(titleCheckbox.prop('indeterminate'));
});

QUnit.test("title checkbox turns indeterminate when some options are selected", function(assert) {
  $("select").append("<option value='one' data-section='top'>One</option>");
  $("select").append("<option value='two' data-section='top'>Two</option>");
  $("select").treeMultiselect();

  var lastCheckbox = $("div.selections").find("div.item > input[type=checkbox]").last();
  lastCheckbox.prop('checked', true).trigger('change');

  var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  assert.ok(titleCheckbox.prop('indeterminate'));
});

QUnit.test("title checkbox is not indeterminate when all options are selected", function(assert) {
  $("select").append("<option value='one' data-section='top'>One</option>");
  $("select").append("<option value='two' data-section='top'>Two</option>");
  $("select").treeMultiselect();

  var checkboxes = $("div.selections").find("input[type=checkbox]");
  checkboxes.prop('checked', true).trigger('change');

  var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  assert.ok(!(titleCheckbox.prop('indeterminate')));
});

QUnit.test("title checkbox is not indeterminate when no options are selected", function(assert) {
  $("select").append("<option value='one' data-section='top'>One</option>");
  $("select").append("<option value='two' data-section='top' selected='selected'>Two</option>");
  $("select").treeMultiselect();

  var checkedCheckboxes = $("div.selections").find("input[type=checkbox]:checked");
  checkedCheckboxes.prop('checked', false).trigger('change');

  var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  assert.ok(!(titleCheckbox.prop('indeterminate')));
});
