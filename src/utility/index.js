var utilArray = require('./array');
var utilDom = require('./dom');

function assert(bool, message) {
  if (!bool) {
    throw new Error(message || 'Assertion failed');
  }
}

function getKey(el) {
  assert(el);
  return parseInt(el.getAttribute('data-key'));
}

module.exports = {
  assert: assert,
  getKey: getKey,

  array: utilArray,
  dom: utilDom
};
