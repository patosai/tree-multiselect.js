var Common = require('./common');

describe('Search', () => {
  var $input;

  beforeEach(() => {
    // value, section
    $("select").append("<option value='abcde' data-section='s1'></option>");

    // section
    $("select").append("<option value='fghij' data-section='s1'>yyyyy</option>");

    // text
    $("select").append("<option value='KLMNOP' data-section='s2'>klmnop</option>");

    // description
    $("select").append("<option value='QRS' data-section='ttt/uuu/vvv' data-description='fox'></option>");

    $("select").treeMultiselect({searchable: true});

    $input = $("input.search");
    assert.equal($input.length, 1);
  });

  it('matches on value', () => {
    ['a', 'c', 'abc', 'cde', 'bcd', 'abcde', 'abcd'].forEach((searchTerm) => {
      $input.val(searchTerm).trigger('input');
      assert(Common.selection({value: 'abcde'}).is(':visible'));
      assert(Common.selection({value: 'fghij'}).is(':hidden'));
      assert(Common.selection({value: 'KLMNOP'}).is(':hidden'));
      assert(Common.selection({value: 'QRS'}).is(':hidden'));
    });

    ['fghij', 'ghi', 'fgh'].forEach((searchTerm) => {
      $input.val(searchTerm).trigger('input');
      assert(Common.selection({value: 'abcde'}).is(':hidden'));
      assert(Common.selection({value: 'fghij'}).is(':visible'));
      assert(Common.selection({value: 'KLMNOP'}).is(':hidden'));
      assert(Common.selection({value: 'QRS'}).is(':hidden'));
    });

    ['q', 'qr', 'qrs', 'rs'].forEach((searchTerm) => {
      $input.val(searchTerm).trigger('input');
      assert(Common.selection({value: 'abcde'}).is(':hidden'));
      assert(Common.selection({value: 'fghij'}).is(':hidden'));
      assert(Common.selection({value: 'KLMNOP'}).is(':hidden'));
      assert(Common.selection({value: 'QRS'}).is(':visible'));
    });
  });

  it('matches on section', () => {
    $input.val('s1').trigger('input');
    assert(Common.selection({value: 'abcde'}).is(':visible'));
    assert(Common.selection({value: 'fghij'}).is(':visible'));
    assert(Common.selection({value: 'KLMNOP'}).is(':hidden'));
    assert(Common.selection({value: 'QRS'}).is(':hidden'));
  });

  it('matches on text', () => {
    $input.val('yyy').trigger('input');
    assert(Common.selection({value: 'abcde'}).is(':hidden'));
    assert(Common.selection({value: 'fghij'}).is(':visible'));
    assert(Common.selection({value: 'KLMNOP'}).is(':hidden'));
    assert(Common.selection({value: 'QRS'}).is(':hidden'));
  });

  it('matches on description', () => {
    $input.val('fox').trigger('input');
    assert(Common.selection({value: 'abcde'}).is(':hidden'));
    assert(Common.selection({value: 'fghij'}).is(':hidden'));
    assert(Common.selection({value: 'KLMNOP'}).is(':hidden'));
    assert(Common.selection({value: 'QRS'}).is(':visible'));
  });

  it('hides sections with no nodes visible', () => {
    $input.val('s1').trigger('input');
    assert(Common.section({text: 's1'}).is(':visible'));
    assert(Common.section({text: 's2'}).is(':hidden'));
    assert(Common.section({text: 'ttt'}).is(':hidden'));
    assert(Common.section({text: 'uuu'}).is(':hidden'));
    assert(Common.section({text: 'vvv'}).is(':hidden'));

    $input.val('uuu').trigger('input');
    assert(Common.section({text: 's1'}).is(':hidden'));
    assert(Common.section({text: 's2'}).is(':hidden'));
    assert(Common.section({text: 'ttt'}).is(':visible'));
    assert(Common.section({text: 'uuu'}).is(':visible'));
    assert(Common.section({text: 'vvv'}).is(':visible'));
  });

  it('shows all sections when no search term is entered', () => {
    $input.val('43t#Q%').trigger('input'); // no nodes should be shown
    assert.equal(Common.selection().filter(':visible').length, 0);

    $input.val('').trigger('input'); // no nodes should be shown
    assert.equal(Common.selection().filter(':hidden').length, 0);
  });
});
