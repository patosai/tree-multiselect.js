var Common = require('./common');

describe('Removing', () => {
  it('can remove tree', () => {
    $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
    var trees = $("select").treeMultiselect();
    var tree = trees[0];

    assert.equal($(".tree-multiselect").length, 1);

    tree.remove();
    assert.equal($(".tree-multiselect").length, 0);
  });
});
