var Common = require('./common');

describe('Options', () => {
  it('is collapsible', () => {
    $("select").append("<option value='one' data-section='test'>One</option>");
    $("select").append("<option value='two' data-section='test'>Two</option>");
    $("select").append("<option value='three' data-section='test'>Three</option>");
    $("select").treeMultiselect();

    var $section = Common.getSections();
    assert.equal($section.length, 1);

    var $title = $section.children("div.title");
    assert.equal($title.length, 1);

    Common.getSelections().each(function() {
      assert($(this).is(":visible"));
    });

    $title.click();

    Common.getSelections().each(function() {
      assert.notOk($(this).is(":visible"));
    });
  });

  it("startCollapsed doesn't do anything if collapsible is false", () => {
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

    var $section = Common.getSections();
    assert.equal($section.length, 3);

    var $title = $section.children("div.title");
    assert.equal($title.length, 3);

    Common.getSelections().each(function() {
      assert($(this).is(":visible"));
    });

    $title.each(() => {
      $(this).click();
      Common.getSelections().each(function() {
        assert($(this).is(":visible"));
      });
    });
  });

  it('can set a different section delimiter', () => {
    var options = {
      sectionDelimiter: '-'
    };

    $("select").append("<option value='one' data-section='top-inner'>One</option>");
    $("select").append("<option value='two' data-section='top-inner'>Two</option>");
    $("select").append("<option value='three' data-section='top-inner2'>Three</option>");

    $("select").treeMultiselect(options);

    var $selections = Common.getSelections();
    assert.equal($selections.length, 3);

    var $sections = Common.getSections();
    assert.equal($selections.length, 3);
    var $innerSections = $sections.first().children(".section");
    assert.equal($innerSections.length, 2);

    assert.equal(Common.textOf($innerSections.first().children('div.title')), 'inner');
    assert.equal(Common.textOf($innerSections.last().children('div.title')), 'inner2');
  });

  it('can disable batch selection', () => {
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

    assert.equal($("input.section[type=checkbox]").length, 0);
  });

  it('can disable section display for selected items', () => {
    $("select").append("<option value='one' data-section='test' data-description='foobar' selected='selected'>One</option>");
    var options = {
      showSectionOnSelected: false
    };
    $("select").treeMultiselect(options);

    var $selectedItem = Common.getSelections();
    assert.equal($selectedItem.length, 1);
    assert.equal($selectedItem.find("span.section-name").length, 0);
  });

  it('can freeze selections', () => {
    $("select").append("<option value='one' data-section='test'>One</option>");
    $("select").append("<option value='two' data-section='test' selected='selected'>Two</option>");
    var options = {
      freeze: true
    };
    $("select").treeMultiselect(options);

    var $checkboxes = Common.getSelections().children("input[type=checkbox]");
    assert.equal($checkboxes.length, 2);
    $checkboxes.each(function() {
      var $checkbox = $(this);
      assert($checkbox.attr('disabled'));
    });

    var removeSpans = $("div.selected span.remove-selected");
    assert.equal(removeSpans.length, 0);
  });

  it('applies only to one tree and not another', () => {
    $("select").append("<option value='one' data-section='test'>One</option>");
    $("select").treeMultiselect();

    $("#fixture").append("<select id='frozen'></select>");
    $("select#frozen").append("<option value='two' data-section='anothertest' selected='selected'>Two</option>");
    var options = {
      freeze: true
    };
    $("select#frozen").treeMultiselect(options);

    var $frozenOption = Common.getSelectionsWithText("Two");
    assert.equal($frozenOption.length, 1);
    assert($frozenOption.find("input[type=checkbox]").attr('disabled'));

    var $unfrozenOption = Common.getSelectionsWithText("One");
    assert.equal($unfrozenOption.length, 1);
    var $checkbox = $unfrozenOption.find("input[type=checkbox]");
    assert.notOk($checkbox.attr('disabled'));
    $checkbox.click();

    var $unfrozenSelection = Common.getSelectedWithText("One");
    assert.equal($unfrozenSelection.length, 1);
    assert.deepEqual($("select").val(), ['one']);
    assert.deepEqual($("select#frozen").val(), ['two']);
  });

  it('hides side panel', () => {
    $("select").append("<option value='one' data-section='test'>One</option>");
    var options = {
      hideSidePanel: true
    };
    $("select").treeMultiselect(options);

    assert.equal($("div.selected").length, 0);
  });

  it('onlyBatchSelection gives checkboxes to only sections', () => {
    $("select").append("<option value='one' data-section='test'>One</option>");
    var options = {
      onlyBatchSelection: true
    };
    $("select").treeMultiselect(options);

    assert.equal($("input.section[type=checkbox]").length, 1);
    assert.equal($("input.option[type=checkbox]").length, 0);
  });

  it('calls onChange with correct arguments when item is removed', (done) => {
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
                    assert(isNaN(selection.initialIndex));
                    assert.equal(selection.section, 'test');
                  }
                  assert.equal(all[0].text, 'One');
                  assert.equal(all[0].value, 'one');
                  assert(isNaN(all[0].initialIndex));
                  assert.equal(all[0].section, 'test');
                  done();
                }
    };
    $("select").treeMultiselect(options);

    var $item = Common.getSelectionsWithText("Two");
    assert.equal($item.length, 1);
    $item.find("input[type=checkbox]").click();
  });

  it('fixes original select value when sorted', () => {
    $("select").append("<option value='one' data-section='test' selected>One</option>");
    $("select").append("<option value='two' data-section='test' selected>Two</option>");
    $("select").treeMultiselect({ sortable: true });

    assert.deepEqual($("select").val(), ['one', 'two']);

    var $selected = Common.getSelected();
    assert.equal($selected.length, 2);
    var $one = $selected.first();
    var $two = $selected.last();

    assert($("div.selected").sortable('option', 'start'));
    $("div.selected").sortable('option', 'start')(null, {
      item: $one
    });
    $one.insertAfter($two);
    assert($("div.selected").sortable('option', 'stop'));
    $("div.selected").sortable('option', 'stop')(null, {
      item: $one
    });

    assert.deepEqual($("select").val(), ['two', 'one']);
  });

  it('puts selected items in right order when sorted', () => {
    $("select").append("<option value='one' data-section='test' selected>One</option>");
    $("select").append("<option value='two' data-section='test' selected>Two</option>");
    $("select").treeMultiselect({ sortable: true });

    var $selected = Common.getSelected();
    assert.equal($selected.length, 2);
    var $one = $selected.first();
    var $two = $selected.last();

    Common.assertSelectedItem($one, {text: 'One', value: 'one', section: 'test'})
    Common.assertSelectedItem($two, {text: 'Two', value: 'two', section: 'test'})

    assert($("div.selected").sortable('option', 'start'));
    $("div.selected").sortable('option', 'start')(null, {
      item: $one
    });
    $one.insertAfter($two);
    assert($("div.selected").sortable('option', 'stop'));
    $("div.selected").sortable('option', 'stop')(null, {
      item: $one
    });

    $selected = Common.getSelected();
    assert.equal($selected.length, 2);
    var $two = $selected.first();
    var $one = $selected.last();
    Common.assertSelectedItem($two, {text: 'Two', value: 'two', section: 'test'})
    Common.assertSelectedItem($one, {text: 'One', value: 'one', section: 'test'})
  });

  it("doesn't do anything when sorted in same order", () => {
    $("select").append("<option value='one' data-section='test' selected>One</option>");
    $("select").append("<option value='two' data-section='test' selected>Two</option>");
    $("select").treeMultiselect({ sortable: true });

    var $selected = Common.getSelected();
    assert.equal($selected.length, 2);
    var $one = $selected.first();
    var $two = $selected.last();

    Common.assertSelectedItem($one, {text: 'One', value: 'one', section: 'test'})
    Common.assertSelectedItem($two, {text: 'Two', value: 'two', section: 'test'})

    assert($("div.selected").sortable('option', 'start'));
    $("div.selected").sortable('option', 'start')(null, {
      item: $one
    });
    assert($("div.selected").sortable('option', 'stop'));
    $("div.selected").sortable('option', 'stop')(null, {
      item: $one
    });

    $selected = Common.getSelected();
    assert.equal($selected.length, 2);
    var $one = $selected.first();
    var $two = $selected.last();
    Common.assertSelectedItem($one, {text: 'One', value: 'one', section: 'test'})
    Common.assertSelectedItem($two, {text: 'Two', value: 'two', section: 'test'})
  });

  it('select all button works', () => {
    $("select").append("<option value='one' data-section='test'>One</option>");
    $("select").append("<option value='two' data-section='test'>Two</option>");
    $("select").treeMultiselect({ enableSelectAll: true });

    var $selectAll = $(".select-all");
    assert.equal($selectAll.length, 1);

    var $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 0);
    assert.deepEqual($("select").val(), null);

    $selectAll.click();

    $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 2);
    assert.deepEqual($("select").val(), ['one', 'two']);
  });

  it('unselect button works', () => {
    $("select").append("<option value='one' data-section='test' selected='selected'>One</option>");
    $("select").append("<option value='two' data-section='test' selected='selected'>Two</option>");
    $("select").treeMultiselect({ enableSelectAll: true });

    var $unselectAll = $(".unselect-all");
    assert.equal($unselectAll.length, 1);

    var $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 2);
    assert.deepEqual($("select").val(), ['one', 'two']);

    $unselectAll.click();

    $selectedItems = Common.getSelected();
    assert.equal($selectedItems.length, 0);
    assert.deepEqual($("select").val(), null);
  });

  it('select all text option', () => {
    $("select").append("<option value='one' data-section='test' selected='selected'>One</option>");
    var selectAllText = "foobar";
    $("select").treeMultiselect({ enableSelectAll: true, selectAllText: selectAllText });

    var $selectAll = $(".select-all");
    assert.equal($selectAll.text(), selectAllText);
  });

  it('unselect all text option', () => {
    $("select").append("<option value='one' data-section='test' selected='selected'>One</option>");
    var unselectAllText = "foobar";
    $("select").treeMultiselect({ enableSelectAll: true, unselectAllText: unselectAllText });

    var $unselectAll = $(".unselect-all");
    assert.equal($unselectAll.text(), unselectAllText);
  });
});
