var Common = require('./common');

describe('Single Selection', () => {
  it('can add an item', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), null);

    var $checkbox = Common.selectionCheckbox({checked: false});
    assert.equal($checkbox.length, 1);
    $checkbox.click();

    var $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 1);

    assert.deepEqual($("select").val(), ['one']);
  });

  it('can remove an item', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $checkbox = Common.selectionCheckbox({checked: true});
    assert.equal($checkbox.length, 1);
    $checkbox.click();

    var $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 0);

    assert.deepEqual($("select").val(), null);
  });

  it('can add an item with the same text', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='two' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['two']);

    var $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 1);

    var $checkbox = Common.selectionCheckbox();
    assert.equal($checkbox.length, 2);

    $checkbox.first().click();

    $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 2);

    assert.deepEqual($("select").val(), ['two', 'one']);
  });

  it('can add an item with the same value as another', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='one' data-section='section' selected>One2</option>");
    $("select").append("<option value='one' data-section='section'>One3</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 1);

    var $checkbox = Common.selectionCheckbox();
    assert.equal($checkbox.length, 3);

    $checkbox.last().click();

    $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 2);

    assert.deepEqual($("select").val(), ['one', 'one']);
  });

  it('can remove an item with the same value as another', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='one' data-section='section' selected>One2</option>");
    $("select").append("<option value='one' data-section='section' selected>One3</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one', 'one']);

    var $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 2);

    var $checkbox = Common.selectionCheckbox();
    assert.equal($checkbox.length, 3);

    $checkbox.last().click();

    $checkboxChecked = Common.selectionCheckbox({checked: true});
    assert.equal($checkboxChecked.length, 1);

    assert.deepEqual($("select").val(), ['one']);
  });

  it('can remove an item by selected item remove button', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $selected = Common.selected();
    assert.equal($selected.length, 1);

    var $removeSpan = $selected.children(".remove-selected");
    $removeSpan.click();

    assert.equal(Common.selected().length, 0);
    assert.equal($("select").val(), null);
  });

  it('can remove an item by unchecking selection checkbox', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one']);

    var $selections = Common.selection();
    var $checkbox = $selections.children("input[type=checkbox]");
    $checkbox.click();

    assert.deepEqual($("select").val(), null);
  });

  it('removing an item does not remove any others', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").append("<option value='two' data-section='section' selected>Two</option>");
    $("select").append("<option value='three' data-section='section' selected>Three</option>");
    $("select").treeMultiselect();

    assert.deepEqual($("select").val(), ['one', 'two', 'three']);

    var $selections = Common.selected();
    assert.equal($selections.length, 3);

    var $removeSpan = $selections.first().children(".remove-selected");
    $removeSpan.click();

    assert.equal(Common.selected().length, 2);
    assert.deepEqual($("select").val(), ['two', 'three']);
  });

  it('fires change event on original select', (done) => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    $("select").change(function() {
      done();
    });

    Common.selection().children("input[type=checkbox]").click();
  });
});
