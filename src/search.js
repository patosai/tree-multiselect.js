var index = {};
var nodeHash = {};

// takes in string values
function buildIndex(options, inNodeHash) {
  for (var ii = 0; ii < options.length; ++ii) {
    var option = options[ii];
    var searchString = option.value + option.text + option.description + option.section;
    index[option.id] = searchString;
  }
  nodeHash = inNodeHash;
}

function search(value) {
  var ids = Object.keys(index);

  if (!value) {
    for (var ii = 0; ii < ids.length; ++ii) {
      nodeHash[ids[ii]].style.display = '';
    }
    return;
  }

  var regex = new RegExp(value, 'i');
  for (var ii = 0; ii < ids.length; ++ii) {
    var id = parseInt(ids[ii]);
    var node = nodeHash[id];
    if (regex.test(index[id])) {
      node.style.display = '';
    } else {
      node.style.display = 'none';
    }
  }
}

module.exports = {
  buildIndex: buildIndex,
  search: search
};
