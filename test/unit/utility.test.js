var Ast = require('ast');
var Util = require('utility');

describe('Utility', () => {
  it('asserts', () => {
    var func = () => {
      Util.assert(true);
    }
    assert.doesNotThrow(func);

    func = () => {
      Util.assert(false);
    }
    assert.throws(func);

    func = () => {
      Util.assert(NaN);
    }
    assert.throws(func);
  });

  it('getKey', () => {
     var el = $("<div data-key='4'></div>")[0];
     assert.equal(Util.getKey(el), 4);

     el = $("<div></div>")[0];
     assert.isNaN(Util.getKey(el));

     el = $("<div data-key='foobar'></div>")[0];
     assert.isNaN(Util.getKey(el));
  });

  it('isInteger', () => {
     assert.isTrue(Util.isInteger(1));
     assert.isTrue(Util.isInteger(-1));
     assert.isTrue(Util.isInteger(0));
     assert.isTrue(Util.isInteger(" 3 "));

     assert.isFalse(Util.isInteger(true));
     assert.isFalse(Util.isInteger(null));
     assert.isFalse(Util.isInteger([]));
     assert.isFalse(Util.isInteger(function () {}));
  })

  describe('array', () => {
    it('subtract', () => {
      var arr1 = [1, 2, 5, 7, 0];
      var arr2 = [2, 7, 8];
      Util.array.subtract(arr1, arr2);
      assert.deepEqual(arr1, [1, 5, 0]);

      arr1 = [];
      arr2 = [];
      Util.array.subtract(arr1, arr2);
      assert.deepEqual(arr1, []);

      arr1 = [];
      arr2 = [0];
      Util.array.subtract(arr1, arr2);
      assert.deepEqual(arr1, []);

      arr1 = [6, 8, 1256];
      arr2 = [];
      Util.array.subtract(arr1, arr2);
      assert.deepEqual(arr1, [6, 8, 1256]);

      arr1 = ["foo", "bar"];
      arr2 = ["baz"];
      Util.array.subtract(arr1, arr2);
      assert.deepEqual(arr1, ["foo", "bar"]);
    });

    it('uniq', () => {
      var arr = [1, 2, 5, 7, 0];
      Util.array.uniq(arr);
      assert.deepEqual(arr, [1, 2, 5, 7, 0]);

      arr = [];
      Util.array.uniq(arr);
      assert.deepEqual(arr, []);

      arr = ["abc", "abc", "ghi"];
      Util.array.uniq(arr);
      assert.deepEqual(arr, ["abc", "ghi"]);

      arr = [123, 678, 900, 123];
      Util.array.uniq(arr);
      assert.deepEqual(arr, [123, 678, 900]);
    });

    it('removeFalseyExceptZero', () => {
      var arr = [1, 4, 0, null, NaN, undefined, 3];
      Util.array.removeFalseyExceptZero(arr);
      assert.deepEqual(arr, [1, 4, 0, 3]);
    });

    it('moveEl in-place', () => {
      var arr = [0, 1, 2, 3, 4, 5];
      Util.array.moveEl(arr, 5, 1);
      assert.deepEqual(arr, [0, 5, 1, 2, 3, 4]);

      arr = [0, 1, 2, 3, 4];
      Util.array.moveEl(arr, 4, 0);
      assert.deepEqual(arr, [4, 0, 1, 2, 3]);

      arr = [0, 1, 2, 3, 4];
      Util.array.moveEl(arr, 0, 4);
      assert.deepEqual(arr, [1, 2, 3, 4, 0]);
    });

    it('intersect', () => {
      var arr = [0, 1, 2, 3, 4, 5];
      var arr2 = [0, 2, 4, 6];
      Util.array.intersect(arr, arr2);
      assert.deepEqual(arr, [0, 2, 4]);

      arr = [1, 17, 536, 24];
      arr2 = [536, 0, 0, 0];
      Util.array.intersect(arr, arr2);
      assert.deepEqual(arr, [536]);

      arr = [0, 0, 0, 0, 0, 0];
      arr2 = [0, 1];
      Util.array.intersect(arr, arr2);
      assert.deepEqual(arr, [0, 0, 0, 0, 0, 0]);
    });

    it('intersectMany', () => {
      var arrays = [[1, 3, 5, 7], [2, 3, 6, 7], [3, 9]];
      assert.deepEqual(Util.array.intersectMany(arrays), [3]);

      var arrays = [[1, 3, 5, 7], [2, 3, 6, 7], [9]];
      assert.deepEqual(Util.array.intersectMany(arrays), []);

      var arrays = [[1, 2, 3, 4], [4, 5, 6, 7], [8, 9]];
      assert.deepEqual(Util.array.intersectMany(arrays), []);

      var arrays = [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]];
      assert.deepEqual(Util.array.intersectMany(arrays), [1, 2, 3, 4]);

      var arrays = [[9, 10, 11, 12], [1, 2, 3, 4], [1, 2, 3, 4]];
      assert.deepEqual(Util.array.intersectMany(arrays), []);
    });

    it('flatten', () => {
      assert.deepEqual(Util.array.flatten([[1], [2], [3, [[4], 'foo', 'bar']]]), [1, 2, 3, 4, 'foo', 'bar']);
      assert.deepEqual(Util.array.flatten([]), []);
      assert.deepEqual(Util.array.flatten(null), null);
      assert.deepEqual(Util.array.flatten('foo'), 'foo');
    });
  });

  describe('dom', () => {
    it('creates nodes with correct tag', () => {
      var node = Util.dom.createNode('div');
      assert.equal(node.tagName, 'DIV');

      node = Util.dom.createNode('span');
      assert.equal(node.tagName, 'SPAN');
    });

    it('creates nodes with correct properties', () => {
      var props = {
        foo: 'bar',
        baz: 'over 9000',
        text: 'foo'
      }
      var node = Util.dom.createNode('div', props);

      assert.equal(node.attributes.length, 2);
      assert.equal(node.getAttribute('foo'), props.foo);
      assert.equal(node.getAttribute('baz'), props.baz);

      assert.equal(node.textContent, props.text);
    });

    it('can tell that AST item is not a section', () => {
      var option = Ast.createItem({
        id: 0,
        value: 'val',
        text: 'text',
        description: 'description'
      });

      assert(option.isItem());
      assert.isFalse(option.isSection());
    });

    it('creates selection node with all properties', () => {
      var section = Ast.createSection('name');

      assert(section.isSection());
      assert.isFalse(section.isItem());
    });

    it('creates selection node with value as text', () => {
      var option = Ast.createItem({
        id: 0,
        value: 'val',
        text: null
      });
      var node = Util.dom.createSelection(option, 0, true, true);
      assert.equal(node.getAttribute('data-value'), 'val');
    });
  });
});
