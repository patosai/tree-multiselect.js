exports.array = require('./array');

exports.assert = function(bool, message) {
  if (!bool) {
    throw new Error(message || 'Assertion failed');
  }
};

exports.dom = require('./dom');

exports.getKey = function(el) {
  exports.assert(el);
  return parseInt(el.getAttribute('data-key'));
};

exports.isInteger = function(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
};
