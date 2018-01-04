const Item = require('./item');
const Section = require('./section');

exports.createLookup = function (arr) {
  return {
    arr: arr,
    children: {}
  };
};

exports.createSection = function (obj) {
  return new Section(obj);
};

exports.createItem = function (obj) {
  return new Item(obj);
};
