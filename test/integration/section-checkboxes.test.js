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

    Common.selection().last().children("input[type=checkbox]").click();

    assert.equal($("input.section[type=checkbox]:checked").length, 1);
    assert.equal($("input.option[type=checkbox]:checked").length, 2);
  });

  it('should not check top level parent if only one child section is completely checked', () => {
    $("select").append("<option value='one' data-section='foo/bar' selected='selected'>One</option>");
    $("select").append("<option value='two' data-section='foo/baz'>Two</option>");
    $("select").treeMultiselect();

    var $topLevel = Common.section({text: 'foo'});
    assert.notOk($topLevel.find("> div.title > input.section[type=checkbox]").is(":checked"));
  });

  it('should uncheck parent sections when a child is unselected', () => {
    $("select").append("<option value='one' data-section='foo' selected>One</option>");
    $("select").treeMultiselect();

    assert.equal($("input.section[type=checkbox]:checked").length, 1);

    Common.selection().first().children("input.option[type=checkbox]").click();

    assert.equal($("input.section[type=checkbox]:checked").length, 0);
  });

  it('checks nested titles', () => {
    $("select").append("<option value='one' data-section='top/middle/inner'>One</option>");
    $("select").treeMultiselect();

    assert.equal($("div.title > input[type=checkbox]").length, 3);
    assert.equal($("div.item > input[type=checkbox]").length, 1);
    assert.equal($("input[type=checkbox]").length, 4);
    assert.equal($("input[type=checkbox]:checked").length, 0);

    var $middleSection = Common.section({text: 'middle'});

    $middleSection.find("> div.title > input[type=checkbox]").click();

    assert.equal($("div.title > input[type=checkbox]:checked").length, 3);
    assert.equal($("div.item > input[type=checkbox]:checked").length, 1);
    assert.equal($("input[type=checkbox]:checked").length, 4);
  });

  it('only checks relevant titles', () => {
    $("select").append("<option value='one' data-section='top/middle/inner'>One</option>");
    $("select").append("<option value='two' data-section='top'>Two</option>");
    $("select").treeMultiselect();

    assert.notOk(Common.sectionCheckbox({text: 'top'}).prop('checked'));
    assert.notOk(Common.sectionCheckbox({text: 'middle'}).prop('checked'));
    assert.notOk(Common.sectionCheckbox({text: 'inner'}).prop('checked'));

    assert.notOk(Common.selectionCheckbox({text: 'One'}).prop('checked'));

    Common.sectionCheckbox({text: 'middle'}).click();

    assert.notOk(Common.sectionCheckbox({text: 'top'}).prop('checked'));
    assert(Common.sectionCheckbox({text: 'middle'}).prop('checked'));
    assert(Common.sectionCheckbox({text: 'inner'}).prop('checked'));

    assert(Common.selectionCheckbox({text: 'One'}).prop('checked'));
  });

  it('checkbox is indeterminate when some children are selected', () => {
    $("select").append("<option value='one' data-section='top/middle/inner' selected>One</option>");
    $("select").append("<option value='two' data-section='top'>Two</option>");
    $("select").treeMultiselect();

    var $topCheckbox = Common.sectionCheckbox({text: 'top'});
    assert.notOk($topCheckbox.prop('checked'));
    assert($topCheckbox.prop('indeterminate'));
  });

  it('checkbox is not indeterminate when all children are selected', () => {
    $("select").append("<option value='one' data-section='top' selected>One</option>");
    $("select").append("<option value='two' data-section='top' selected>Two</option>");
    $("select").treeMultiselect();

    var $titleCheckbox = Common.sectionCheckbox({text: 'top'});
    assert.notOk($titleCheckbox.prop('indeterminate'));
  });

  it('checkbox is not indeterminate when no children are selected', () => {
    $("select").append("<option value='one' data-section='top'>One</option>");
    $("select").append("<option value='two' data-section='top'>Two</option>");
    $("select").treeMultiselect();

    var $titleCheckbox = Common.sectionCheckbox({text: 'top'});
    assert.notOk($titleCheckbox.prop('indeterminate'));
  });
});
