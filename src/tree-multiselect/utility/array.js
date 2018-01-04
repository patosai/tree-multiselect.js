// keeps if pred is true
function filterInPlace (arr, pred) {
  var idx = 0;
  for (var ii = 0; ii < arr.length; ++ii) {
    if (pred(arr[ii])) {
      arr[idx] = arr[ii];
      ++idx;
    }
  }
  arr.length = idx;
}

exports.flatten = function (arr, r) {
  if (!Array.isArray(arr)) {
    return arr;
  }

  r = r || [];

  for (var ii = 0; ii < arr.length; ++ii) {
    if (Array.isArray(arr[ii])) {
      r.concat(exports.flatten(arr[ii], r));
    } else {
      r.push(arr[ii]);
    }
  }

  return r;
};

exports.uniq = function (arr) {
  var hash = {};

  var pred = function (val) {
    var returnVal = !hash[val];
    hash[val] = true;
    return returnVal;
  };
  filterInPlace(arr, pred);
};

exports.removeFalseyExceptZero = function (arr) {
  var pred = function (val) {
    return val || val === 0;
  };
  filterInPlace(arr, pred);
};

exports.moveEl = function (arr, oldPos, newPos) {
  var el = arr[oldPos];
  arr.splice(oldPos, 1);
  arr.splice(newPos, 0, el);
};

exports.subtract = function (arr, arrExcluded) {
  var hash = {};

  for (var ii = 0; ii < arrExcluded.length; ++ii) {
    hash[arrExcluded[ii]] = true;
  }

  var pred = function (val) {
    return !hash[val];
  };
  filterInPlace(arr, pred);
};

exports.intersect = function (arr, arrExcluded) {
  var hash = {};

  for (var ii = 0; ii < arrExcluded.length; ++ii) {
    hash[arrExcluded[ii]] = true;
  }

  var pred = function (val) {
    return hash[val];
  };
  filterInPlace(arr, pred);
};

// takes in array of arrays
// arrays are presorted
exports.intersectMany = function (arrays) {
  var indexLocations = [];
  var maxIndexLocations = [];
  arrays.forEach((array) => {
    indexLocations.push(0);
    maxIndexLocations.push(array.length - 1);
  });

  var finalOutput = [];
  for (; indexLocations.length > 0 && indexLocations[0] <= maxIndexLocations[0]; ++indexLocations[0]) {
    // advance indices to be at least equal to first array element
    var terminate = false;
    for (var ii = 1; ii < arrays.length; ++ii) {
      while (arrays[ii][indexLocations[ii]] < arrays[0][indexLocations[0]] &&
             indexLocations[ii] <= maxIndexLocations[ii]) {
        ++indexLocations[ii];
      }
      if (indexLocations[ii] > maxIndexLocations[ii]) {
        terminate = true;
        break;
      }
    }

    if (terminate) {
      break;
    }

    // check element equality
    var shouldAdd = true;
    for (var jj = 1; jj < arrays.length; ++jj) {
      if (arrays[0][indexLocations[0]] !== arrays[jj][indexLocations[jj]]) {
        shouldAdd = false;
        break;
      }
    }

    if (shouldAdd) {
      finalOutput.push(arrays[0][indexLocations[0]]);
    }
  }

  return finalOutput;
};
