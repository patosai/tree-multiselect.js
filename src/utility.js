// Note: array functions are only tested for for arrays of integers
// since that is what this plugin needs

module.exports = {
  assert(bool, message) {
    if (!bool) {
      throw new Error(message || 'Assertion failed');
    }
  },

  getKey(el) {
    this.assert(el);
    return parseInt(el.getAttribute('data-key'));
  },

  array: {
    subtract(arr1, arr2) {
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
    },

    uniq(arr) {
      var hash = {};
      var newArr = [];
      for (var ii = 0; ii < arr.length; ++ii) {
        if (!hash[arr[ii]]) {
          hash[arr[ii]] = true;
          newArr.push(arr[ii]);
        }
      }
      return newArr;
    },

    removeFalseyExceptZero(arr) {
      var newArr = [];
      for (var ii = 0; ii < arr.length; ++ii) {
        if (arr[ii] || arr[ii] === 0) {
          newArr.push(arr[ii]);
        }
      }
      return newArr;
    },

    moveEl(arr, oldPos, newPos) {
      var el = arr[oldPos];
      arr.splice(oldPos, 1);
      arr.splice(newPos, 0, el);
    },

    intersect(arr, arrExcluded) {
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
    },
  },

  dom: {
    createNode(tag, props) {
      var node = document.createElement(tag);
      for (var key in props) {
        if (props.hasOwnProperty(key)) {
          node.setAttribute(key, props[key]);
        }
      }
      return node;
    }
  }
};
