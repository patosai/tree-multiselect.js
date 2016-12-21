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

  describe('array', () => {
    it('subtract', () => {
      var arr1 = [1, 2, 5, 7, 0];
      var arr2 = [2, 7, 8];
      assert.deepEqual(Util.array.subtract(arr1, arr2), [1, 5, 0]);

      arr1 = [];
      arr2 = [];
      assert.deepEqual(Util.array.subtract(arr1, arr2), []);

      arr1 = [];
      arr2 = [0];
      assert.deepEqual(Util.array.subtract(arr1, arr2), []);

      arr1 = [6, 8, 1256];
      arr2 = [];
      assert.deepEqual(Util.array.subtract(arr1, arr2), [6, 8, 1256]);

      arr1 = ["foo", "bar"];
      arr2 = ["baz"];
      assert.deepEqual(Util.array.subtract(arr1, arr2), ["foo", "bar"]);
    });

    it('uniq', () => {
      var arr = [1, 2, 5, 7, 0];
      assert.deepEqual(Util.array.uniq(arr), [1, 2, 5, 7, 0]);

      arr = [];
      assert.deepEqual(Util.array.uniq(arr), []);

      arr = ["abc", "abc", "ghi"];
      assert.deepEqual(Util.array.uniq(arr), ["abc", "ghi"]);

      arr = [123, 678, 900, 123];
      assert.deepEqual(Util.array.uniq(arr), [123, 678, 900]);
    });

    it('removeFalseyExceptZero', () => {
      var arr = [1, 4, 0, null, NaN, undefined, 3];
      assert.deepEqual(Util.array.removeFalseyExceptZero(arr), [1, 4, 0, 3]);
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
      assert.deepEqual(Util.array.intersect(arr, arr2), [0, 2, 4]);
      assert.deepEqual(Util.array.intersect(arr2, arr), [0, 2, 4]);

      arr = [1, 17, 536, 24];
      arr2 = [536, 0, 0, 0];
      assert.deepEqual(Util.array.intersect(arr, arr2), [536]);
      assert.deepEqual(Util.array.intersect(arr2, arr), [536]);

      arr = [0, 0, 0, 0, 0, 0];
      arr2 = [0, 1];
      assert.deepEqual(Util.array.intersect(arr, arr2), [0, 0, 0, 0, 0, 0]);
      assert.deepEqual(Util.array.intersect(arr2, arr), [0]);
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
  });
});
