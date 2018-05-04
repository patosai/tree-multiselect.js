const AstCommon = require('./common');

const Util = require('../utility');

function Section (obj) {
  obj = obj || {};

  this.treeId = obj.treeId;
  this.id = obj.id;
  this.name = obj.name;
  this.items = [];

  this.node = null;
}

Section.prototype.isSection = function () {
  return true;
};

Section.prototype.isItem = function () {
  return false;
};

Section.prototype.addSearchHitMarker = function (isSearchHit) {
  AstCommon.addSearchHitMarker(this.node, isSearchHit);
};

Section.prototype.removeSearchHitMarker = function (isSearchHit) {
  AstCommon.removeSearchHitMarker(this.node, isSearchHit);
};

Section.prototype.isNotSearchHit = function () {
  return AstCommon.isNotSearchHit(this.node);
};

Section.prototype.render = function (createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSection(this, createCheckboxes, disableCheckboxes);
  }
  return this.node;
};

module.exports = Section;
