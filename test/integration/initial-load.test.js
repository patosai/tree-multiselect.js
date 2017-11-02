var Common = require('./common');

describe('Initial Load', () => {
  it('creates container', () => {
    assert.equal($(".tree-multiselect").length, 0);
    assert.equal($(".tree-multiselect div.selections").length, 0);
    assert.equal($(".tree-multiselect div.selected").length, 0);

    $("select").treeMultiselect();
    assert.equal($(".tree-multiselect").length, 1);
    assert.equal($(".tree-multiselect div.selections").length, 1);
    assert.equal($(".tree-multiselect div.selected").length, 1);
  });

  it('renders option', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 1);

    var $selection = $selections.first();

    Common.assertSelection($selection, {text: 'One', value: 'one'});

    var $checkbox = $selection.children("input[type=checkbox]");
    var $label = $selection.children("label");
    assert.equal($checkbox.length, 1);
    assert.equal($label.length, 1);
    assert.equal($checkbox.attr('id'), $label.attr('for'));
  });

  it('renders multiple options', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='two' data-section='section'>Two</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    Common.assertSelection($selections[0], {text: 'One', value: 'one'});
    Common.assertSelection($selections[1], {text: 'Two', value: 'two'});
  });

  it('renders options with the same value', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='one' data-section='section'>One duplicate</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    Common.assertSelection($selections[0], {text: 'One', value: 'one'});
    Common.assertSelection($selections[1], {text: 'One duplicate', value: 'one'});
  });

  it('renders options with the same value and text', () => {
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").append("<option value='one' data-section='section'>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    Common.assertSelection($selections[0], {text: 'One', value: 'one'});
    Common.assertSelection($selections[1], {text: 'One', value: 'one'});
  });

  it('renders options without data-section', () => {
    $("select").append("<option value='one'>One</option>");
    $("select").append("<option value='two'>Two</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    Common.assertSelection($selections[0], {text: 'One', value: 'one'});
    Common.assertSelection($selections[1], {text: 'Two', value: 'two'});
  });

  it('respects selected attribute', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 1);

    var $selected = Common.selected();
    assert.equal($selected.length, 1);

    assert.deepEqual($("select").val(), ['one']);
  });

  it('respects data-index attribute', () => {
    $("select").append("<option value='one' data-section='section' data-index='1' selected>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 1);

    var $selected = Common.selected();
    assert.equal($selected.length, 1);
    Common.assertSelection($selected, {text: 'One', value: 'one'});

    assert.deepEqual($("select").val(), ['one']);
  });

  it("only respects data-index if selected", () => {
    $("select").append("<option value='one' data-section='section' data-index='2'>One</option>");
    $("select").append("<option value='two' data-section='section' data-index='2' selected>Two</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    var $selected = Common.selected();
    assert.equal($selected.length, 1);
    Common.assertSelection($selected, {text: 'Two', value: 'two'});

    assert.deepEqual($("select").val(), ['two']);
  });

  it('renders selected item correctly', () => {
    $("select").append("<option value='one' data-section='section/foo/bar' data-index='1' selected>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 1);

    var $selected = Common.selected();
    assert.equal($selected.length, 1);

    Common.assertSelection($selected, {text: 'One', value: 'one'});

    var $sectionName = $selected.first().children(".section-name");
    assert.equal($sectionName.length, 1);
    assert.equal(Common.textOf($sectionName[0]), "section/foo/bar");
  });

  it('ranks data-index lowest to highest', () => {
    $("select").append("<option value='two' data-section='section' data-index='2' selected>Two</option>");
    $("select").append("<option value='three' data-section='section' data-index='3' selected>Three</option>");
    $("select").append("<option value='one' data-section='section' data-index='1' selected>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 3);

    var $selected = Common.selected();
    assert.equal($selected.length, 3);

    Common.assertSelection($selected[0], {text: 'One', value: 'one'});
    Common.assertSelection($selected[1], {text: 'Two', value: 'two'});
    Common.assertSelection($selected[2], {text: 'Three', value: 'three'});

    assert.deepEqual($("select").val(), ['one', 'two', 'three']);
  });

  it('handles non-consecutive data-index', () => {
    $("select").append("<option value='two' data-section='section' data-index='593' selected>Two</option>");
    $("select").append("<option value='one' data-section='section' data-index='1' selected>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    var $selected = Common.selected();
    assert.equal($selected.length, 2);

    Common.assertSelection($selected[0], {text: 'One', value: 'one'});
    Common.assertSelection($selected[1], {text: 'Two', value: 'two'});

    assert.deepEqual($("select").val(), ['one', 'two']);
  });

  it('ranks data-index higher than selected attribute', () => {
    $("select").append("<option value='one' data-section='section' selected>One</option>");
    $("select").append("<option value='two' data-section='section' selected data-index='300'>Two</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    var $selected = Common.selected();
    assert.equal($selected.length, 2);

    Common.assertSelection($selected[0], {text: 'Two', value: 'two'});
    Common.assertSelection($selected[1], {text: 'One', value: 'one'});

    assert.deepEqual($("select").val(), ['two', 'one']);
  });

  it("data-index doesn't do string comparison", () => {
    $("select").append("<option value='one' data-section='section' data-index='2' selected>One</option>");
    $("select").append("<option value='two' data-section='section' data-index='10' selected>Two</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    var $selected = Common.selected();
    assert.equal($selected.length, 2);

    Common.assertSelection($selected[0], {text: 'One', value: 'one'});
    Common.assertSelection($selected[1], {text: 'Two', value: 'two'});

    assert.deepEqual($("select").val(), ['one', 'two']);
  });

  it("repeated data-index results in original order", () => {
    $("select").append("<option value='two' data-section='section' data-index='2' selected>Two</option>");
    $("select").append("<option value='one' data-section='section' data-index='2' selected>One</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 2);

    var $selected = Common.selected();
    assert.equal($selected.length, 2);

    Common.assertSelection($selected[0], {text: 'Two', value: 'two'});
    Common.assertSelection($selected[1], {text: 'One', value: 'one'});

    assert.deepEqual($("select").val(), ['two', 'one']);
  });

  it("repeated data-index comes before sequential data-index", () => {
    $("select").append("<option value='one' data-section='section' data-index='2' selected>One</option>");
    $("select").append("<option value='two' data-section='section' data-index='3' selected>Two</option>");
    $("select").append("<option value='three' data-section='section' data-index='2' selected>Three</option>");
    $("select").treeMultiselect();

    var $selections = Common.selection();
    assert.equal($selections.length, 3);

    var $selected = Common.selected();
    assert.equal($selected.length, 3);

    Common.assertSelection($selected[0], {text: 'One', value: 'one'});
    Common.assertSelection($selected[1], {text: 'Three', value: 'three'});
    Common.assertSelection($selected[2], {text: 'Two', value: 'two'});

    assert.deepEqual($("select").val(), ['one', 'three', 'two']);
  });
});
