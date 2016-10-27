var Util = require('utility');

QUnit.module("Utility");

QUnit.test("arraySubtract works", function(assert) {
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

QUnit.test("arrayUniq works", function(assert) {
  var arr = [1, 2, 5, 7, 0];
  assert.deepEqual(Util.arrayUniq(arr), [1, 2, 5, 7, 0]);

  arr = [];
  assert.deepEqual(Util.arrayUniq(arr), []);

  arr = ["abc", "abc", "ghi"];
  assert.deepEqual(Util.arrayUniq(arr), ["abc", "ghi"]);

  arr = [123, 678, 900, 123];
  assert.deepEqual(Util.arrayUniq(arr), [123, 678, 900]);
});
