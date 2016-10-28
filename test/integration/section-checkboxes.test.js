var Common = require('./common');

describe('Section checkboxes', () => {
  it('is all checked when all children are selected initially', () => {
    $("select").append("<option value='one' data-section='foo' selected>One</option>");
    $("select").append("<option value='two' data-section='foo' selected>Two</option>");
    $("select").treeMultiselect();

    assert.equal($("input[type=checkbox]").length, 3);
    assert.equal($("input.option[type=checkbox]").length, 2);
    assert.equal($("input.section[type=checkbox]").length, 1);
    assert.equal($("input[type=checkbox]:checked").length, 3);
  });

  it('should all be checked when all children are selected', () => {
    $("select").append("<option value='one' data-section='foo' selected>One</option>");
    $("select").append("<option value='two' data-section='foo'>Two</option>");
    $("select").treeMultiselect();

    assert.equal($("input[type=checkbox]").length, 3);
    assert.equal($("input.option[type=checkbox]").length, 2);
    assert.equal($("input.section[type=checkbox]").length, 1);

    assert.equal($("input.section[type=checkbox]:checked").length, 0);
    assert.equal($("input.option[type=checkbox]:checked").length, 1);

    Common.getSelections().last().children("input[type=checkbox]").click();

    assert.equal($("input.section[type=checkbox]:checked").length, 1);
    assert.equal($("input.option[type=checkbox]:checked").length, 2);
  });

  it('should not check top level parent if only one child section is completely checked', () => {
    $("select").append("<option value='one' data-section='foo/bar' selected='selected'>One</option>");
    $("select").append("<option value='two' data-section='foo/baz'>Two</option>");
    $("select").treeMultiselect();

    var $topLevel = Common.getSectionsWithTitle("foo");
    assert.notOk($topLevel.find("> div.title > input.section[type=checkbox]").is(":checked"));
  });

  it('should uncheck parent sections when a child is unselected', () => {
    $("select").append("<option value='one' data-section='foo' selected>One</option>");
    $("select").treeMultiselect();

    assert.equal($("input.section[type=checkbox]:checked").length, 1);

    Common.getSelections().first().children("input.option[type=checkbox]").click();

    assert.equal($("input.section[type=checkbox]:checked").length, 0);
  });

  it('checks nested titles', () => {
    $("select").append("<option value='one' data-section='top/middle/inner'>One</option>");
    $("select").treeMultiselect();

    assert.equal($("div.title > input[type=checkbox]").length, 3);
    assert.equal($("div.item > input[type=checkbox]").length, 1);
    assert.equal($("input[type=checkbox]").length, 4);
    assert.equal($("input[type=checkbox]:checked").length, 0);

    var $middleSection = Common.getSectionsWithTitle('middle');

    $middleSection.find("> div.title > input[type=checkbox]").click();

    assert.equal($("div.title > input[type=checkbox]:checked").length, 3);
    assert.equal($("div.item > input[type=checkbox]:checked").length, 1);
    assert.equal($("input[type=checkbox]:checked").length, 4);
  });

  it('only checks relevant titles', () => {
    $("select").append("<option value='one' data-section='top/middle/inner'>One</option>");
    $("select").append("<option value='two' data-section='top'>Two</option>");
    $("select").treeMultiselect();

    assert.equal($("div.title > input[type=checkbox]").length, 3);
    assert.equal($("div.item > input[type=checkbox]").length, 2);
    assert.equal($("input[type=checkbox]").length, 5);
    assert.equal($("input[type=checkbox]:checked").length, 0);

    var $middleSection = Common.getSectionsWithTitle('middle');

    $middleSection.find("> div.title > input[type=checkbox]").click();

    assert.equal($("div.title > input[type=checkbox]:checked").length, 2);
    assert.equal($("div.item > input[type=checkbox]:checked").length, 1);
    assert.equal($("input[type=checkbox]:checked").length, 3);
  });
});

//QUnit.test("title checkbox is indeterminate when some but not all options are selected", function(assert) {
  //$("select").append("<option value='one' data-section='top'>One</option>");
  //$("select").append("<option value='two' data-section='top' selected='selected'>Two</option>");
  //$("select").treeMultiselect();

  //var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  //assert.equal(titleCheckbox.length, 1);
  //assert.ok(titleCheckbox.prop('indeterminate'));
//});

//QUnit.test("title checkbox turns indeterminate when some options are selected", function(assert) {
  //$("select").append("<option value='one' data-section='top'>One</option>");
  //$("select").append("<option value='two' data-section='top'>Two</option>");
  //$("select").treeMultiselect();

  //var lastCheckbox = $("div.selections").find("div.item > input[type=checkbox]").last();
  //lastCheckbox.prop('checked', true).trigger('change');

  //var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  //assert.ok(titleCheckbox.prop('indeterminate'));
//});

//QUnit.test("title checkbox is not indeterminate when all options are selected", function(assert) {
  //$("select").append("<option value='one' data-section='top'>One</option>");
  //$("select").append("<option value='two' data-section='top'>Two</option>");
  //$("select").treeMultiselect();

  //var checkboxes = $("div.selections").find("input[type=checkbox]");
  //checkboxes.prop('checked', true).trigger('change');

  //var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  //assert.ok(!(titleCheckbox.prop('indeterminate')));
//});

//QUnit.test("title checkbox is not indeterminate when no options are selected", function(assert) {
  //$("select").append("<option value='one' data-section='top'>One</option>");
  //$("select").append("<option value='two' data-section='top' selected='selected'>Two</option>");
  //$("select").treeMultiselect();

  //var checkedCheckboxes = $("div.selections").find("input[type=checkbox]:checked");
  //checkedCheckboxes.prop('checked', false).trigger('change');

  //var titleCheckbox = $("div.selections").find("div.title > input[type=checkbox]");
  //assert.ok(!(titleCheckbox.prop('indeterminate')));
//});
