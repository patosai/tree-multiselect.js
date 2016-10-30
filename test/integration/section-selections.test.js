var Common = require('./common');

describe('Section Selections', () => {
  it('adds all child elements when section checkbox clicked', () => {
    $("select").append("<option value='one' data-section='foo'>One</option>");
    $("select").append("<option value='two' data-section='foo'>Two</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), null);
    var $selected = Common.selected();
    assert.equal($selected.length, 0);

    var $checkbox = Common.sectionCheckbox();
    assert.equal($checkbox.length, 1);
    $checkbox.click();

    assert.deepEqual($("select").val(), ['one', 'two']);

    $selected = Common.selected();
    assert.equal($selected.length, 2);
    Common.assertSelected($selected[0], {text: 'One', value: 'one', section: 'foo'});
    Common.assertSelected($selected[1], {text: 'Two', value: 'two', section: 'foo'});
  });

  it("doesn't add child elements twice when other child elements are selected", () => {
    $("select").append("<option value='one' data-section='foo'>One</option>");
    $("select").append("<option value='two' data-section='foo'>Two</option>");
    $("select").append("<option value='three' data-section='foo/bar/baz' selected>Three</option>");
    $("select").append("<option value='four' data-section='foo/bar/baz' selected>Four</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['three', 'four']);
    var $selected = Common.selected();
    assert.equal($selected.length, 2);
    Common.assertSelected($selected[0], {text: 'Three', value: 'three', section: 'foo/bar/baz'});
    Common.assertSelected($selected[1], {text: 'Four', value: 'four', section: 'foo/bar/baz'});

    var $checkbox = Common.sectionCheckbox();
    assert.equal($checkbox.length, 3);
    $checkbox.first().click();

    assert.deepEqual($("select").val(), ['three', 'four', 'one', 'two']);

    $selected = Common.selected();
    assert.equal($selected.length, 4);
    Common.assertSelected($selected[0], {text: 'Three', value: 'three', section: 'foo/bar/baz'});
    Common.assertSelected($selected[1], {text: 'Four', value: 'four', section: 'foo/bar/baz'});
    Common.assertSelected($selected[2], {text: 'One', value: 'one', section: 'foo'});
    Common.assertSelected($selected[3], {text: 'Two', value: 'two', section: 'foo'});
  });

  it('removes child elements when section unselected', () => {
    $("select").append("<option value='one' data-section='foo' selected>One</option>");
    $("select").append("<option value='two' data-section='foo' selected>Two</option>");
    $("select").append("<option value='three' data-section='foo/bar/baz' selected>Three</option>");
    $("select").append("<option value='four' data-section='foo/bar/baz' selected>Four</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one', 'two', 'three', 'four']);
    var $selected = Common.selected();
    Common.assertSelected($selected[0], {text: 'One', value: 'one', section: 'foo'});
    Common.assertSelected($selected[1], {text: 'Two', value: 'two', section: 'foo'});
    Common.assertSelected($selected[2], {text: 'Three', value: 'three', section: 'foo/bar/baz'});
    Common.assertSelected($selected[3], {text: 'Four', value: 'four', section: 'foo/bar/baz'});

    var $checkbox = Common.sectionCheckbox({text: 'baz'});
    assert.equal($checkbox.length, 1);
    $checkbox.click();

    assert.deepEqual($("select").val(), ['one', 'two']);

    $selected = Common.selected();
    assert.equal($selected.length, 2);
    Common.assertSelected($selected[0], {text: 'One', value: 'one', section: 'foo'});
    Common.assertSelected($selected[1], {text: 'Two', value: 'two', section: 'foo'});
  });
});
