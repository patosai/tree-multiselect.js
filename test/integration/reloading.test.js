var Common = require('./common');

describe('Reloading', () => {
  it('can reload tree', () => {
    $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
    var trees = $("select").treeMultiselect();
    var tree = trees[0];

    assert.equal(Common.selection().length, 1);
    assert.equal(Common.selection({text: 'One'}).length, 1);

    $("select").append("<option value='two' data-section='foo' selected='selected' data-description='Two'>Two</option>");

    tree.reload();
    assert.equal(Common.selection().length, 2);
    assert.equal(Common.selection({text: 'One'}).length, 1);
    assert.equal(Common.selection({text: 'Two'}).length, 1);
  });

  it('reload ignores user-changed options', () => {
    $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
    var trees = $("select").treeMultiselect();
    var tree = trees[0];

    assert.equal(Common.selection().length, 1);
    assert.equal(Common.selected().length, 1);
    assert.equal($("select").val().length, 1);

    $("select").val([]);
    $("select").change();

    $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
    tree.reload();

    assert.equal(Common.selection().length, 2);
    assert.equal(Common.selected().length, 2);
    assert.equal($("select").val().length, 2);
  });
});
