require('tree-multiselect');

var Util = require('utility');

describe('Adding and Removing', () => {
  beforeEach(() => {
    var $fixture = $("#fixture");
    if (!$fixture.length) {
      $fixture = $("<div id='fixture'></div>");
      $("body").append($fixture);
    }

    $fixture.empty();

    var select = document.createElement("select");
    select.setAttribute("multiple", "multiple");
    $fixture.append(select);
  });

  it('testing', () => {
    assert(false);
  });

  //it('can add an item', () => {
    //$("select").append("<option value='one' data-section='section'>One</option>");
    //$("select").treeMultiselect();

    //assert.equal($("div.selections div.item").length, 1);
    //assert.equal($("div.selected div.item").length, 0);

    //$("div.selections div.item > input[type=checkbox]").click();

    //assert.equal($("div.selections div.item > input[type=checkbox]:checked").length, 1);
    //var selectedItem = $("div.selected div.item");
    //assert.equal($("div.selected div.item").length, 1);

    //assert.equal(Util.textOf(selectedItem), 'One');
    //assert.equal(Util.textOf(selectedItem.find("> span.section-name")), 'section');
  //});
})
//QUnit.module("Adding and Removing", {
  //beforeEach: function(assert) {
    //var select = document.createElement("select");
    //select.setAttribute("multiple", "multiple");
    //$("div#qunit-fixture").append(select);
    //assert.equal($("select").length, 1);
  //}
//});

//QUnit.test("can add an item", function(assert) {
  //$("select").append("<option value='one' data-section='section'>One</option>");
  //$("select").treeMultiselect();

  //assert.equal($("div.selections div.item").length, 1);
  //assert.equal($("div.selected div.item").length, 0);

  //$("div.selections div.item > input[type=checkbox]").click();

  //assert.equal($("div.selections div.item > input[type=checkbox]:checked").length, 1);
  //var selectedItem = $("div.selected div.item");
  //assert.equal($("div.selected div.item").length, 1);

  //assert.equal(Util.textOf(selectedItem), 'One');
  //assert.equal(Util.textOf(selectedItem.find("> span.section-name")), 'section');
//});

//QUnit.test("can add an item with the same text", function(assert) {
  //$("select").append("<option value='one' data-section='section'>One</option>");
  //$("select").append("<option value='one_more' data-section='section1'>One</option>");
  //$("select").treeMultiselect();

  //assert.equal($("div.selections div.item").length, 2);
  //assert.equal($("div.selected div.item").length, 0);

  //$("div.selections div.item > input[type=checkbox]").click();

  //assert.equal($("div.selections div.item > input[type=checkbox]:checked").length, 2);
  //var selectedItem = $("div.selected div.item");
  //assert.equal($("div.selected div.item").length, 2);

  //assert.equal(Util.textOf(selectedItem.first()), 'One');
  //assert.equal(Util.textOf(selectedItem.last()), 'One');
  //assert.equal(Util.textOf(selectedItem.first().find("> span.section-name")), 'section');
  //assert.equal(Util.textOf(selectedItem.last().find("> span.section-name")), 'section1');

  //var correct_val = ['one', 'one_more'];
  //var select_val = $("select").val();
  //assert.equal(select_val.length, correct_val.length);
  //for (var i = 0; i < correct_val.length; ++i) {
    //assert.equal(select_val[i], correct_val[i]);
  //}
//});

//QUnit.test("can remove an item", function(assert) {
  //$("select").append("<option value='one' data-section='section' selected='selected'>One</option>");
  //$("select").treeMultiselect();

  //var selectedItem = $("div.selected div.item");
  //assert.equal(selectedItem.length, 1);

  //var removeSpan = selectedItem.find("> span.remove-selected");
  //removeSpan.trigger('click');

  //assert.equal($("div.selected div.item").length, 0);
//});

//QUnit.test("removing an item does not remove any others", function(assert) {
  //$("select").append("<option value='one' data-section='A' selected='selected'>One</option>");
  //$("select").append("<option value='two' data-section='A' selected='selected'>Two</option>");
  //$("select").append("<option value='three' data-section='A/B' selected='selected'>Three</option>");
  //$("select").append("<option value='four' data-section='A/B' selected='selected'>Four</option>");
  //$("select").append("<option value='five' data-section='another section' selected='selected'>Five</option>");
  //$("select").treeMultiselect();

  //assert.equal($("div.selected div.item").length, 5);

  //var thirdItem = $("div.selected div.item").filter(function() {
    //return Util.textOf($(this)) == 'Three';
  //});

  //thirdItem.find("span.remove-selected").trigger('click');

  //assert.equal($("div.selected div.item").length, 4);

  //var itemWithLabelThree = $("div.selected div.item").filter(function() {
    //return Util.textOf($(this)) == 'Three';
  //});
  //assert.equal(itemWithLabelThree.length, 0);
//});

//QUnit.test("can add items with digit values", function(assert) {
  //$("select").append("<option value='10712' data-section='107'>10712</option>");
  //$("select").append("<option value='10796' data-section='107' selected='selected'>10796</option>");
  //$("select").treeMultiselect();

  //assert.equal($('div.selections div.item').length, 2);
  //assert.equal($('div.selected div.item').length, 1);
//});

//QUnit.test("fires change event when original select is modified", function(assert) {
  //$("select").append("<option value='10712' data-section='107'>10712</option>");
  //$("select").treeMultiselect();

  //var done = assert.async();
  //$("select").change(function() {
    //done();
  //});

  //$("div.item input[type=checkbox]").click();
//});

//QUnit.test("change event also fires for plain Javascript callbacks", function(assert) {
  //$("select").append("<option value='10712' data-section='107'>10712</option>");
  //$("select").treeMultiselect();

  //var done = assert.async();
  //var selectEl = $("select")[0];
  //selectEl.onchange = function() {
    //done();
  //};

  //$("div.item input[type=checkbox]").click();
//});

//QUnit.test("data-key attribute is added", function(assert) {
  //$("select").append("<option value='1' data-section='foo'>1</option>");
  //$("select").append("<option value='2' data-section='foo'>2</option>");
  //$("select").append("<option value='3' data-section='bar'>3</option>");
  //$("select").treeMultiselect();

  //var $firstEl = $("div.selections div.item").filter(function() {
    //return Util.textOf(this) == '1';
  //});
  //assert.equal(parseInt($firstEl.attr('data-key')), 0);

  //var $secondEl = $("div.selections div.item").filter(function() {
    //return Util.textOf(this) == '2';
  //});
  //assert.equal(parseInt($secondEl.attr('data-key')), 1);

  //var $thirdEl = $("div.selections div.item").filter(function() {
    //return Util.textOf(this) == '3';
  //});
  //assert.equal(parseInt($thirdEl.attr('data-key')), 2);
//});
