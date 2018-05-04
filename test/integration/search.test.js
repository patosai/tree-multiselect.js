var Common = require('./common');

function getVisibleSelections(props) {
  return Common.selection(props).filter((_, el) => {
    return el.getAttribute('searchhit') === 'true';
  })
}

function getHiddenSelections(props) {
  return Common.selection(props).filter((_, el) => {
    return el.getAttribute('searchhit') === 'false';
  })
}

describe('Search', () => {
  var $input;

  describe('default behavior', () => {
    beforeEach(() => {
      // value, section
      $("select").append("<option value='abcde' data-section='s1'></option>");

      // section
      $("select").append("<option value='fghij' data-section='s1'>yyyyy</option>");

      // text
      $("select").append("<option value='KLMNOP' data-section='s2'>klmnop</option>");

      // description
      $("select").append("<option value='QRS' data-section='ttt/uuu/vvv' data-description='fox'></option>");

      $("select").treeMultiselect({searchable: true, enableSelectAll: true});

      $input = $("input.search");
      assert.equal($input.length, 1);
    });

    it('matches on value', () => {
      ['a', 'c', 'abc', 'cde', 'bcd', 'abcde', 'abcd'].forEach((searchTerm) => {
        $input.val(searchTerm).trigger('input');
        assert.equal(Common.selection({value: 'abcde'}).attr('searchhit'), 'true');
        assert.equal(Common.selection({value: 'fghij'}).attr('searchhit'), 'false');
        assert.equal(Common.selection({value: 'KLMNOP'}).attr('searchhit'), 'false');
        assert.equal(Common.selection({value: 'QRS'}).attr('searchhit'), 'false');
      });

      ['fghij', 'ghi', 'fgh'].forEach((searchTerm) => {
        $input.val(searchTerm).trigger('input');
        assert.equal(Common.selection({value: 'abcde'}).attr('searchhit'), 'false');
        assert.equal(Common.selection({value: 'fghij'}).attr('searchhit'), 'true');
        assert.equal(Common.selection({value: 'KLMNOP'}).attr('searchhit'), 'false');
        assert.equal(Common.selection({value: 'QRS'}).attr('searchhit'), 'false');
      });

      ['q', 'qr', 'qrs', 'rs'].forEach((searchTerm) => {
        $input.val(searchTerm).trigger('input');
        assert.equal(Common.selection({value: 'abcde'}).attr('searchhit'), 'false');
        assert.equal(Common.selection({value: 'fghij'}).attr('searchhit'), 'false');
        assert.equal(Common.selection({value: 'KLMNOP'}).attr('searchhit'), 'false');
        assert.equal(Common.selection({value: 'QRS'}).attr('searchhit'), 'true');
      });
    });

    it('matches on section', () => {
      $input.val('s1').trigger('input');
      assert.equal(Common.selection({value: 'abcde'}).attr('searchhit'), 'true');
      assert.equal(Common.selection({value: 'fghij'}).attr('searchhit'), 'true');
      assert.equal(Common.selection({value: 'KLMNOP'}).attr('searchhit'), 'false');
      assert.equal(Common.selection({value: 'QRS'}).attr('searchhit'), 'false');
    });

    it('matches on text', () => {
      $input.val('yyy').trigger('input');
      assert.equal(Common.selection({value: 'abcde'}).attr('searchhit'), 'false');
      assert.equal(Common.selection({value: 'fghij'}).attr('searchhit'), 'true');
      assert.equal(Common.selection({value: 'KLMNOP'}).attr('searchhit'), 'false');
      assert.equal(Common.selection({value: 'QRS'}).attr('searchhit'), 'false');
    });

    it('matches on description', () => {
      $input.val('fox').trigger('input');
      assert.equal(Common.selection({value: 'abcde'}).attr('searchhit'), 'false');
      assert.equal(Common.selection({value: 'fghij'}).attr('searchhit'), 'false');
      assert.equal(Common.selection({value: 'KLMNOP'}).attr('searchhit'), 'false');
      assert.equal(Common.selection({value: 'QRS'}).attr('searchhit'), 'true');
    });

    it('hides sections with no nodes visible', () => {
      $input.val('s1').trigger('input');
      assert.equal(Common.section({text: 's1'}).attr('searchhit'), 'true');
      assert.equal(Common.section({text: 's2'}).attr('searchhit'), 'false');
      assert.equal(Common.section({text: 'ttt'}).attr('searchhit'), 'false');
      assert.equal(Common.section({text: 'uuu'}).attr('searchhit'), 'false');
      assert.equal(Common.section({text: 'vvv'}).attr('searchhit'), 'false');

      $input.val('uuu').trigger('input');
      assert.equal(Common.section({text: 's1'}).attr('searchhit'), 'false');
      assert.equal(Common.section({text: 's2'}).attr('searchhit'), 'false');
      assert.equal(Common.section({text: 'ttt'}).attr('searchhit'), 'true');
      assert.equal(Common.section({text: 'uuu'}).attr('searchhit'), 'true');
      assert.equal(Common.section({text: 'vvv'}).attr('searchhit'), 'true');
    });

    it('shows all sections when no search term is entered', () => {
      $input.val('43t#Q%').trigger('input'); // no nodes should be shown
      assert.equal(getVisibleSelections().length, 0);

      $input.val('').trigger('input'); // no nodes should be shown
      assert.equal(getHiddenSelections().length, 0);
    });

    it('only adds filtered selections when using section checkbox', () => {
      $input.val('abcde').trigger('input');

      assert.equal(Common.selected().length, 0);
      Common.sectionCheckbox({text: 's1'}).click();
      assert.equal(Common.selected().length, 1);

      $input.val('fox').trigger('input');
      assert.equal(Common.selected().length, 1);
      var $tttCheckbox = Common.sectionCheckbox({text: 'ttt'})
      $tttCheckbox.click();
      assert.equal(Common.selected().length, 2);

      $tttCheckbox.click();
      assert.equal(Common.selected().length, 1);
    });

    it('only adds filtered selections when selecting and unselecting all', () => {
      $input.val('s1').trigger('input');

      var $selectAll = $(".select-all");
      var $unselectAll = $(".unselect-all");
      assert.equal($selectAll.length, 1);
      assert.equal($unselectAll.length, 1);

      assert.equal(Common.selected().length, 0);
      $selectAll.click();
      assert.equal(Common.selected().length, 2);

      $input.val('abcde').trigger('input');
      $unselectAll.click();
      assert.equal(Common.selected().length, 1);
    })
  });

  describe('custom search params', () => {
    beforeEach(() => {
      $("select").append("<option value='abcde' data-section='s1' data-description='xyz'>ayy</option>");

    });

    it('section only', () => {
      $("select").treeMultiselect({searchable: true, searchParams: ['section']});
      $input = $("input.search");

      $input.val('s1').trigger('input');
      assert.equal(getVisibleSelections().length, 1);

      $input.val('abc').trigger('input');
      assert.equal(getVisibleSelections().length, 0);

      $input.val('ayy').trigger('input');
      assert.equal(getVisibleSelections().length, 0);

      $input.val('xyz').trigger('input');
      assert.equal(getVisibleSelections().length, 0);
    });

    it('value only', () => {
      $("select").treeMultiselect({searchable: true, searchParams: ['value']});
      $input = $("input.search");

      $input.val('s1').trigger('input');
      assert.equal(getVisibleSelections().length, 0);

      $input.val('abc').trigger('input');
      assert.equal(getVisibleSelections().length, 1);

      $input.val('ayy').trigger('input');
      assert.equal(getVisibleSelections().length, 0);

      $input.val('xyz').trigger('input');
      assert.equal(getVisibleSelections().length, 0);
    });

    it('text and description', () => {
      $("select").treeMultiselect({searchable: true, searchParams: ['text', 'description']});
      $input = $("input.search");

      $input.val('s1').trigger('input');
      assert.equal(getVisibleSelections().length, 0);

      $input.val('abc').trigger('input');
      assert.equal(getVisibleSelections().length, 0);

      $input.val('ayy').trigger('input');
      assert.equal(getVisibleSelections().length, 1);

      $input.val('xyz').trigger('input');
      assert.equal(getVisibleSelections().length, 1);
    });
  });
});
