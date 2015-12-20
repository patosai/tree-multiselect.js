QUnit.module("Options", {
  beforeEach: function(assert) {
    var select = document.createElement("select");
    select.setAttribute("multiple", "multiple");
    $("div#qunit-fixture").append(select);
    assert.equal($("select").length, 1);
  }
});

QUnit.test("Is collapsible by default, but not collapsed", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  $("select").append("<option value='two' data-section='test'>Two</option>");
  $("select").append("<option value='three' data-section='test'>Three</option>");
  $("select").treeMultiselect();

  $("div.section").each(function() {
    var collapseSpan = $(this).find("> div.title > span.collapse-section");
    assert.equal(collapseSpan.length, 1);
  });

  $("div.item").each(function() {
    assert.ok($(this).is(":visible"));
  });
});

QUnit.test("Can be collapsed if specified", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  $("select").append("<option value='two' data-section='test'>Two</option>");
  $("select").append("<option value='three' data-section='test'>Three</option>");

  $("select").append("<option value='four' data-section='test/inner'>Four</option>");
  $("select").append("<option value='five' data-section='test/inner2'>Five</option>");
  $("select").append("<option value='Six' data-section='test/inner2'>Six</option>");

  var options = {
    startCollapsed: true
  };

  $("select").treeMultiselect(options);

  $("div.item").each(function() {
    assert.ok($(this).is(":hidden"));
  });

  $("div.section div.section").each(function() {
    assert.ok($(this).is(":hidden"));
  });
});

QUnit.test("startCollapsed doesn't do anything if collapsible is false", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  $("select").append("<option value='two' data-section='test'>Two</option>");
  $("select").append("<option value='three' data-section='test'>Three</option>");

  $("select").append("<option value='four' data-section='test/inner'>Four</option>");
  $("select").append("<option value='five' data-section='test/inner2'>Five</option>");
  $("select").append("<option value='Six' data-section='test/inner2'>Six</option>");

  var options = {
    collapsible: false,
    startCollapsed: true
  };

  $("select").treeMultiselect(options);

  $("div.item").each(function() {
    assert.ok($(this).is(":visible"));
  });

  $("div.section div.section").each(function() {
    assert.ok($(this).is(":visible"));
  });
});

QUnit.test("can set a different section delimiter", function(assert) {
  var options = {
    sectionDelimiter: '-'
  };

  $("select").append("<option value='one' data-section='top-inner'>One</option>");
  $("select").append("<option value='two' data-section='top-inner'>Two</option>");
  $("select").append("<option value='three' data-section='top-inner2'>Three</option>");

  $("select").treeMultiselect(options);

  assert.equal($("div.selections div.section").length, 3, "should be three sections");

  var innerSections = $("div.selections div.section > div.section");
  assert.equal(innerSections.length, 2, "should be two inner sections");

  assert.equal(textOf(innerSections.first().find("div.title")), "inner");
  assert.equal(textOf(innerSections.last().find("div.title")), "inner2");
});

QUnit.test("can disable batch select", function(assert) {
  var options = {
    allowBatchSelection: false
  };

  $("select").append("<option value='one' data-section='test'>One</option>");
  $("select").append("<option value='two' data-section='test'>Two</option>");
  $("select").append("<option value='three' data-section='test'>Three</option>");

  $("select").append("<option value='four' data-section='test/inner'>Four</option>");
  $("select").append("<option value='five' data-section='test/inner2'>Five</option>");
  $("select").append("<option value='Six' data-section='test/inner2'>Six</option>");
  $("select").treeMultiselect(options);

  var title = $("div.selections > div.section > div.title");

  assert.equal(title.find("> input[type=checkbox]").length, 0);
});

QUnit.test("can disable section display on selected items", function(assert) {
  $("select").append("<option value='one' data-section='test' data-description='foobar' selected='selected'>One</option>");
  var options = {
    showSectionOnSelected: false
  };
  $("select").treeMultiselect(options);

  var selectedItem = $("div.selected div.item");
  assert.equal(selectedItem.length, 1);
  assert.equal(selectedItem.find("span.section-name").length, 0);
});

QUnit.test("can freeze selections", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  $("select").append("<option value='two' data-section='test' selected='selected'>Two</option>");
  var options = {
    freeze: true
  };
  $("select").treeMultiselect(options);

  var checkboxes = $("div.selections div.item > input[type=checkbox]");
  assert.equal(checkboxes.length, 2);
  checkboxes.each(function() {
    var checkbox = $(this);
    assert.ok(checkbox.attr('disabled'));
  });

  var removeSpans = $("div.selected span.remove-selected");
  assert.equal(removeSpans.length, 0);
});

QUnit.test("freeze does not affect other treeMultiselects", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  var options = {
    freeze: true
  };
  $("select").treeMultiselect(options);

  $("div#qunit-fixture").append("<select id='frozen'></select>");
  $("select#frozen").append("<option value='two' data-section='test' selected='selected'>Two</option>");
  $("select#frozen").treeMultiselect();

  var frozenOption = $("div.selections div.item:contains(One)");
  assert.equal(frozenOption.length, 1);
  assert.ok(!!frozenOption.find("input[type=checkbox]").attr('disabled'));

  var unfrozenOption = $("div.selections div.item:contains(Two)");
  assert.equal(unfrozenOption.length, 1);
  unfrozenOption.find("input[type=checkbox]").prop('checked', 'true').trigger('change');

  var unfrozenSelection = $("div.selected div.item:contains(Two)");
  assert.equal(unfrozenSelection.length, 1);
  assert.equal(unfrozenSelection.find("span.remove-selected").length, 1);
});

QUnit.test("Selected panel is not removed by default", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  $("select").treeMultiselect();

  assert.equal($("div.selected").length, 1);
});

QUnit.test("hideSidePanel removes the selected panel", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  var options = {
    hideSidePanel: true
  };
  $("select").treeMultiselect(options);

  assert.equal($("div.selected").length, 0);
});

QUnit.test("onlyBatchSelection adds checkboxes to only sections", function(assert) {
  $("select").append("<option value='one' data-section='test'>One</option>");
  var options = {
    onlyBatchSelection: true
  };
  $("select").treeMultiselect(options);
  assert.equal($("div.title").length, 1);
  assert.equal($("div.item").length, 1);

  assert.equal($("div.title > input[type=checkbox]").length, 1);
  assert.equal($("div.item > input[type=checkbox]").length, 0);
});

QUnit.test("onChange callback is called with correct args when item is added", function(assert) {
  var done = assert.async();
  $("select").append("<option value='one' data-section='test' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='test'>Two</option>");
  var options = {
    onChange: function(all, added, removed) {
                assert.equal(all.length, 2);
                assert.equal(added.length, 1);
                assert.equal(removed.length, 0);
                var expectedSecondSelections = [all[1], added[0]];
                for (var i = 0; i < expectedSecondSelections.length; ++i) {
                  var selection = expectedSecondSelections[i];
                  assert.equal(selection.text, 'Two');
                  assert.equal(selection.value, 'two');
                  assert.equal(selection.initialIndex, undefined);
                  assert.equal(selection.sectionName, 'test');
                }
                assert.equal(all[0].text, 'One');
                assert.equal(all[0].value, 'one');
                assert.equal(all[0].initialIndex, undefined);
                assert.equal(all[0].sectionName, 'test');
                done();
              }
  };
  $("select").treeMultiselect(options);

  var item = $("div.selections div.item").filter(function() {
    return textOf($(this)) == 'Two';
  });
  item.find("input[type=checkbox]").click();
});

QUnit.test("onChange callback is called with correct args when item is removed", function(assert) {
  var done = assert.async();
  $("select").append("<option value='one' data-section='test' selected='selected'>One</option>");
  $("select").append("<option value='two' data-section='test'>Two</option>");
  var options = {
    onChange: function(all, added, removed) {
                assert.equal(all.length, 0);
                assert.equal(added.length, 0);
                assert.equal(removed.length, 1);

                var removedSelection = removed[0];
                assert.equal(removedSelection.text, 'One');
                assert.equal(removedSelection.value, 'one');
                assert.equal(removedSelection.initialIndex, undefined);
                assert.equal(removedSelection.sectionName, 'test');
                done();
              }
  };
  $("select").treeMultiselect(options);

  var item = $("div.selections div.item").filter(function() {
    return textOf($(this)) == 'One';
  });
  item.find("input[type=checkbox]").click();
});
