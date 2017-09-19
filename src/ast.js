const Util = require('./utility');

function Section(obj) {
  obj = obj || {};

  this.treeId = obj.treeId;
  this.id = obj.id;
  this.name = obj.name;
  this.items = [];

  this.node = null;
}

Section.prototype.isSection = function() {
  return true;
};

Section.prototype.isItem = function() {
  return false;
};

Section.prototype.render = function(createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSection(this, createCheckboxes, disableCheckboxes);
  }
  return this.node;
};

function Item(obj) {
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

Item.prototype.isSection = function() {
  return false;
};

Item.prototype.isItem = function() {
  return true;
};

Item.prototype.render = function(createCheckboxes, disableCheckboxes) {
  if (!this.node) {
    this.node = Util.dom.createSelection(this, createCheckboxes, disableCheckboxes);
  }
  return this.node;
};

exports.createLookup = function(arr) {
  return {
    arr: arr,
    children: {}
  };
};

exports.createSection = function(obj) {
  return new Section(obj);
};

exports.createItem = function(obj) {
  return new Item(obj);
};
