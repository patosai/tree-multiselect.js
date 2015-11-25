QUnit.module("Visual Features", {
  beforeEach: function(assert) {
    var select = document.createElement("select");
    select.setAttribute("multiple", "multiple");
    $("div#qunit-fixture").append(select);
    assert.equal($("select").length, 1);
  }
});

QUnit.test("data-description popup should show when hovered, and be removed when mouse leaves", function(assert) {
  $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
  $("select").treeMultiselect();

  var $descriptions = $("div.item > span.description");
  assert.equal($descriptions.length, 1);

  $($descriptions[0]).mouseenter();
  var tempPopup = $("div.temp-description-popup");
  assert.equal(tempPopup.length, 1);
  assert.equal(textOf(tempPopup), 'One');

  $($descriptions[0]).mouseleave();
  tempPopup = $("div.temp-description-popup");
  assert.equal(tempPopup.length, 0);
});

QUnit.test("each item has its own description popup", function(assert) {
  $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
  $("select").append("<option value='two' data-section='foo' selected='selected' data-description='Two'>Two</option>");
  $("select").treeMultiselect();

  var $descriptions = $("div.item > span.description");
  assert.equal($descriptions.length, 2);

  $($descriptions[0]).mouseenter();
  var tempPopup = $("div.temp-description-popup");
  assert.equal(tempPopup.length, 1);

  $($descriptions[1]).mouseenter();
  tempPopup = $("div.temp-description-popup");
  assert.equal(tempPopup.length, 2);

  assert.equal(textOf(tempPopup[0]), 'One');
  assert.equal(textOf(tempPopup[1]), 'Two');

  $($descriptions[0]).mouseleave();
  tempPopup = $("div.temp-description-popup");
  assert.equal(tempPopup.length, 1);
  assert.equal(textOf(tempPopup[0]), 'Two');

  $($descriptions[1]).mouseleave();
  tempPopup = $("div.temp-description-popup");
  assert.equal(tempPopup.length, 0);
});

QUnit.test("can collapse sections by clicking on description show/hide span", function(assert) {
  $("select").append("<option value='one' data-section='foo' data-description='One'>One</option>");
  $("select").append("<option value='two' data-section='foo' selected='selected' data-description='Two'>Two</option>");
  $("select").append("<option value='three' data-section='foo' data-description='Three'>Three</option>");
  $("select").treeMultiselect();

  var barSection = $("div.section").has("div.title").has("span.collapse-section");
  assert.equal(barSection.length, 1);

  assert.equal($("div.selections div.item:visible").length, 3);

  barSection.find("span.collapse-section").click();

  assert.equal($("div.selections div.item:visible").length, 0);
});

QUnit.test("can collapse sections by clicking on section bars", function(assert) {
  $("select").append("<option value='one' data-section='foo' data-description='One'>One</option>");
  $("select").append("<option value='two' data-section='foo' selected='selected' data-description='Two'>Two</option>");
  $("select").append("<option value='three' data-section='foo' data-description='Three'>Three</option>");
  $("select").treeMultiselect();

  var barSection = $("div.section").has("div.title");
  assert.equal(barSection.length, 1);

  assert.equal($("div.selections div.item:visible").length, 3);

  barSection.find("div.title").click();

  assert.equal($("div.selections div.item:visible").length, 0);
});
