function assert(bool, message) {
  if (!bool) {
    throw new Error(message || "Assertion failed");
  }
}

function getKey(el) {
  assert(el);
  var item = el.attributes.getNamedItem("data-key");
  if (item) {
    return parseInt(item.value);
  } else {
    return null;
  }
}

function arraySubtract(arr1, arr2) {
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

function arrayUniq(arr) {
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

function arrayRemoveFalseyExceptZero(arr) {
  var newArr = [];
  for (var ii = 0; ii < arr.length; ++ii) {
    if (arr[ii] || arr[ii] === 0) {
      newArr.push(arr[ii]);
    }
  }
  return newArr;
}

function arrayMoveEl(arr, oldPos, newPos) {
  var el = arr[oldPos];
  arr.splice(oldPos, 1);
  arr.splice(newPos, 0, el);
}

function arrayIntersect(arr, arrExcluded) {
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
  assert: assert,

  getKey: getKey,

  arraySubtract: arraySubtract,

  arrayUniq: arrayUniq,

  arrayRemoveFalseyExceptZero: arrayRemoveFalseyExceptZero,

  arrayMoveEl: arrayMoveEl,

  arrayIntersect: arrayIntersect
};
