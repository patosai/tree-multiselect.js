function subtract(arr1, arr2) {
  var hash = {};
  var returnArr = [];
  for (var ii = 0; ii < arr2.length; ++ii) {
    hash[arr2[ii]] = true;
  }
  for (var jj = 0; jj < arr1.length; ++jj) {
    if (!hash[arr1[jj]]) {
      returnArr.push(arr1[jj]);
    }
  }
  return returnArr;
}

function uniq(arr) {
  var hash = {};
  var newArr = [];
  for (var ii = 0; ii < arr.length; ++ii) {
    if (!hash[arr[ii]]) {
      hash[arr[ii]] = true;
      newArr.push(arr[ii]);
    }
  }
  return newArr;
}

function removeFalseyExceptZero(arr) {
  var newArr = [];
  for (var ii = 0; ii < arr.length; ++ii) {
    if (arr[ii] || arr[ii] === 0) {
      newArr.push(arr[ii]);
    }
  }
  return newArr;
}

function moveEl(arr, oldPos, newPos) {
  var el = arr[oldPos];
  arr.splice(oldPos, 1);
  arr.splice(newPos, 0, el);
}

function intersect(arr, arrExcluded) {
  var newArr = [];
  var hash = {};
  for (var ii = 0; ii < arrExcluded.length; ++ii) {
    hash[arrExcluded[ii]] = true;
  }
  for (var jj = 0; jj < arr.length; ++jj) {
    if (hash[arr[jj]]) {
      newArr.push(arr[jj]);
    }
  }
  return newArr;
}

module.exports = {
  subtract: subtract,
  uniq: uniq,
  removeFalseyExceptZero: removeFalseyExceptZero,
  moveEl: moveEl,
  intersect: intersect
};
