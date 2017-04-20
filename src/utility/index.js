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
