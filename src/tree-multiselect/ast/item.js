const AstCommon = require('./common');

const Util = require('../utility');

function Item (obj) {
  obj = obj || {};

  this.treeId = obj.treeId;
  this.id = obj.id;
  this.value = obj.value;
  this.text = obj.text;
  this.description = obj.description;
  this.initialIndex = obj.initialIndex ? parseInt(obj.initialIndex) : null;
  this.section = obj.section;
  this.disabled = obj.disabled;
  this.selected = obj.selected;

  this.node = null;
}

Item.prototype.isSection = function () {
  return false;
};

Item.prototype.isItem = function () {
  return true;
};

Item.prototype.addSearchHitMarker = function (isSearchHit) {
  AstCommon.addSearchHitMarker(this.node, isSearchHit);
};

Item.prototype.removeSearchHitMarker = function (isSearchHit) {
  AstCommon.removeSearchHitMarker(this.node, isSearchHit);
};

Item.prototype.isNotSearchHit = function () {
  return AstCommon.isNotSearchHit(this.node);
};

Item.prototype.render = function (createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSelection(this, createCheckboxes, disableCheckboxes);
  }
  return this.node;
};

module.exports = Item;
