exports.createLookup = function(arr) {
  return {
    arr: arr,
    children: {}
  };
};

exports.createSection = function(name) {
  return {
    type: 'section',
    name: name,
    items: []
  };
};

exports.isSection = function(obj) {
  return obj && obj.type === 'section';
};

exports.getSectionName = function(section) {
  return section.name;
};

exports.getSectionItems = function(section) {
  return section.items;
};

exports.createItem = function(id, value, text, description, initialIndex, section) {
  return {
    type: 'item',
    id: id,
    value: value,
    text: text,
    description: description,
    initialIndex: initialIndex,
    section: section
  };
};

exports.isItem = function(obj) {
  return obj && obj.type === 'item';
};
