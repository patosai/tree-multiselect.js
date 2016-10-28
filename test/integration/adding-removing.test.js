var Util = require('utility');

var Common = require('./common');

describe('Adding and Removing', () => {
  it('can add an item', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), null);

    var $checkbox = Common.getSelections().children("input[type=checkbox]");
    assert.equal($checkbox.length, 1);
    $checkbox.click();

    var $checkboxChecked = Common.getSelections().children("input[type=checkbox]:checked");
    assert.equal($checkboxChecked.length, 1);

    var $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 1);

    Common.assertSelectedItem($selectedItems[0], {text: 'One', value: 'one', section: 'section'});
    assert.deepEqual($("select").val(), ['one']);
  });

  it('can remove an item', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $checkbox = Common.getSelections().children("input[type=checkbox]:checked");
    assert.equal($checkbox.length, 1);
    $checkbox.click();

    var $checkboxChecked = Common.getSelections().children("input[type=checkbox]:checked");
    assert.equal($checkboxChecked.length, 0);

    var $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 0);
    assert.deepEqual($("select").val(), null);
  });

  it('can add an item with the same text', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='two' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['two']);

    var $checkboxChecked = Common.getSelections().children("input[type=checkbox]:checked");
    assert.equal($checkboxChecked.length, 1);

    var $checkbox = Common.getSelections().children("input[type=checkbox]");
    assert.equal($checkbox.length, 2);

    $checkbox.first().click();

    var $checkboxChecked = Common.getSelections().children("input[type=checkbox]:checked");
    assert.equal($checkboxChecked.length, 2);

    var $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 2);

    Common.assertSelectedItem($selectedItems[0], {text: 'One', value: 'two', section: 'section'});
    Common.assertSelectedItem($selectedItems[1], {text: 'One', value: 'one', section: 'section'});
    assert.deepEqual($("select").val(), ['two', 'one']);
  });

  it('can add an item with the same value', () => {
    // TODO investigate
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='one' data-section='section' selected>One2</option>");
    $("select").append("<option value='one' data-section='section'>One3</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $checkboxChecked = Common.getSelections().children("input[type=checkbox]:checked");
    assert.equal($checkboxChecked.length, 1);

    var $checkbox = Common.getSelections().children("input[type=checkbox]");
    assert.equal($checkbox.length, 3);

    $checkbox.last().click();

    var $checkboxChecked = Common.getSelections().children("input[type=checkbox]:checked");
    assert.equal($checkboxChecked.length, 2);

    var $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 2);

    Common.assertSelectedItem($selectedItems[0], {text: 'One2', value: 'one', section: 'section'});
    Common.assertSelectedItem($selectedItems[1], {text: 'One3', value: 'one', section: 'section'});
    assert.deepEqual($("select").val(), ['one', 'one']);
  });

  it('can remove an item by selected item remove button', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $selected = Common.getSelected();
    assert.equal($selected.length, 1);

    var $removeSpan = $selected.children(".remove-selected");
    $removeSpan.click();

    assert.equal(Common.getSelected().length, 0);
    assert.equal($("select").val(), null);
  });

  it('can remove an item by unchecking selection checkbox', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $selections = Common.getSelections();
    var $checkbox = $selections.children("input[type=checkbox]");
    $checkbox.click();

    assert.equal(Common.getSelected().length, 0);
    assert.deepEqual($("select").val(), null);
  });

  it('removing an item does not remove any others', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").append("<option value='two' data-section='section' selected>Two</option>");
    $("select").append("<option value='three' data-section='section' selected>Three</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one', 'two', 'three']);

    var $selections = Common.getSelected();
    assert.equal($selections.length, 3);

    var $removeSpan = $selections.first().children(".remove-selected");
    $removeSpan.click();

    assert.equal(Common.getSelected().length, 2);
    assert.deepEqual($("select").val(), ['two', 'three']);
  });

  it('fires change event on original select', (done) => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    $("select").change(function() {
      done();
    });

    Common.getSelections().children("input[type=checkbox]").click();
  });
});
