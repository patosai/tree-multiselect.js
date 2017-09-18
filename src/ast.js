function Section(name) {
  this.name = name;
  this.items = [];
}

Section.prototype.isSection = function() {
  return true;
};

Section.prototype.isItem = function() {
  return false;
};

function Item(obj) {
  obj = obj || {};

  this.type = 'item';
  this.id = obj.id;
  this.value = obj.value;
  this.text = obj.text;
  this.description = obj.description;
  this.initialIndex = parseInt(obj.initialIndex);
  this.section = obj.section;
  this.disabled = obj.disabled;
}

Item.prototype.isSection = function() {
  return false;
};

Item.prototype.isItem = function() {
  return true;
};

exports.createLookup = function(arr) {
  return {
    arr: arr,
    children: {}
  };
};

exports.createSection = function(name) {
  return new Section(name);
};

exports.createItem = function(obj) {
  return new Item(obj);
};
