var Common = require('./common');

describe('Interactivity', () => {
  it('data-description pops up when moused over', () => {
    $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
    $("select").treeMultiselect();

    var $descriptions = $("div.item > span.description");
    assert.equal($descriptions.length, 1);

    $descriptions.first().mouseenter();
    var $tempPopup = $(".temp-description-popup");
    assert.equal($tempPopup.length, 1);
    assert.equal(Common.textOf($tempPopup), 'One');

    $descriptions.first().mouseleave();
    $tempPopup = $(".temp-description-popup");
    assert.equal($tempPopup.length, 0);
  });

  it('data-description is removed when mouse leaves', () => {
    $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
    $("select").treeMultiselect();

    var $descriptions = $("div.item > span.description");
    assert.equal($descriptions.length, 1);

    $descriptions.first().mouseenter();
    var $tempPopup = $(".temp-description-popup");
    assert.equal($tempPopup.length, 1);

    $descriptions.first().mouseleave();
    $tempPopup = $(".temp-description-popup");
    assert.equal($tempPopup.length, 0);
  });

  it('collapses when clicking on titlebar', () => {
    $("select").append("<option value='one' data-section='foo' data-description='One'>One</option>");
    $("select").append("<option value='two' data-section='foo' selected='selected' data-description='Two'>Two</option>");
    $("select").append("<option value='three' data-section='foo' data-description='Three'>Three</option>");
    $("select").treeMultiselect();

    var $title = Common.section({text: 'foo'}).children(".title");
    assert.equal($("div.selections div.item:visible").length, 3);

    $title.click();
    assert.equal($("div.selections div.item:visible").length, 0);
  });
});
