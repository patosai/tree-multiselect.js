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

  it('arraySubtract', () => {
    var arr1 = [1, 2, 5, 7, 0];
    var arr2 = [2, 7, 8];
    assert.deepEqual(Util.arraySubtract(arr1, arr2), [1, 5, 0]);

    arr1 = [];
    arr2 = [];
    assert.deepEqual(Util.arraySubtract(arr1, arr2), []);

    arr1 = [];
    arr2 = [0];
    assert.deepEqual(Util.arraySubtract(arr1, arr2), []);

    arr1 = [6, 8, 1256];
    arr2 = [];
    assert.deepEqual(Util.arraySubtract(arr1, arr2), [6, 8, 1256]);

    arr1 = ["foo", "bar"];
    arr2 = ["baz"];
    assert.deepEqual(Util.arraySubtract(arr1, arr2), ["foo", "bar"]);
  });

  it('arrayUniq', () => {
    var arr = [1, 2, 5, 7, 0];
    assert.deepEqual(Util.arrayUniq(arr), [1, 2, 5, 7, 0]);

    arr = [];
    assert.deepEqual(Util.arrayUniq(arr), []);

    arr = ["abc", "abc", "ghi"];
    assert.deepEqual(Util.arrayUniq(arr), ["abc", "ghi"]);

    arr = [123, 678, 900, 123];
    assert.deepEqual(Util.arrayUniq(arr), [123, 678, 900]);
  });

  it('arrayRemoveFalseyExceptZero', () => {
    var arr = [1, 4, 0, null, NaN, undefined, 3];
    assert.deepEqual(Util.arrayRemoveFalseyExceptZero(arr), [1, 4, 0, 3]);
  });

  it('arrayMoveEl in-place', () => {
    var arr = [0, 1, 2, 3, 4, 5];
    Util.arrayMoveEl(arr, 5, 1);
    assert.deepEqual(arr, [0, 5, 1, 2, 3, 4]);

    arr = [0, 1, 2, 3, 4];
    Util.arrayMoveEl(arr, 4, 0);
    assert.deepEqual(arr, [4, 0, 1, 2, 3]);

    arr = [0, 1, 2, 3, 4];
    Util.arrayMoveEl(arr, 0, 4);
    assert.deepEqual(arr, [1, 2, 3, 4, 0]);
  });

  it('arrayIntersect', () => {
    var arr = [0, 1, 2, 3, 4, 5];
    var arr2 = [0, 2, 4, 6];
    assert.deepEqual(Util.arrayIntersect(arr, arr2), [0, 2, 4]);
    assert.deepEqual(Util.arrayIntersect(arr2, arr), [0, 2, 4]);

    arr = [1, 17, 536, 24];
    arr2 = [536, 0, 0, 0];
    assert.deepEqual(Util.arrayIntersect(arr, arr2), [536]);
    assert.deepEqual(Util.arrayIntersect(arr2, arr), [536]);

    arr = [0, 0, 0, 0, 0, 0];
    arr2 = [0, 1];
    assert.deepEqual(Util.arrayIntersect(arr, arr2), [0, 0, 0, 0, 0, 0]);
    assert.deepEqual(Util.arrayIntersect(arr2, arr), [0]);
  });
});
