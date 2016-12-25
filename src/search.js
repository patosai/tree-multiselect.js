var Util = require('./utility');

const MAX_SAMPLE_SIZE = 3;

function Search(options, inSelectionNodeHash, inSectionNodeHash) {
  this.options = options;

  this.index = {}; // key: at most three-letter combinations, value: array of data-key

  // key: data-key, value: DOM node
  this.selectionNodeHash = inSelectionNodeHash;
  this.selectionNodeHashKeys = Object.keys(inSelectionNodeHash);

  this.sectionNodeHash = inSectionNodeHash;
  this.sectionNodeHashKeys = Object.keys(inSectionNodeHash);

  this.buildIndex();
}

Search.prototype.buildIndex = function() {
  // options are sorted by id already
  // trigrams
  this.options.forEach((option) => {
    var searchWords = Util.array.removeFalseyExceptZero([option.value, option.text, option.description, option.section]).map((item) => {
      return item.toLowerCase();
    });

    searchWords.forEach((searchWord) => {
      var words = searchWord.split(' ');
      words.forEach((word) => {
        this._addToIndex(word, option.id);
      });
    });
  });
};

Search.prototype._addToIndex = function(key, id) {
  for (var sample_size = 1; sample_size <= MAX_SAMPLE_SIZE; ++sample_size) {
    for (var start_offset = 0; start_offset < key.length - sample_size + 1; ++start_offset) {
      var minikey = key.substring(start_offset, start_offset + sample_size);

      if (!this.index[minikey]) {
        this.index[minikey] = [];
      }

      // don't duplicate
      // this takes advantage of the fact that the minikeys with same id's are added sequentially
      var length = this.index[minikey].length;
      if (length === 0 || this.index[minikey][length - 1] !== id) {
        this.index[minikey].push(id);
      }
    }
  }
};

Search.prototype.search = function(value) {
  if (!value) {
    this.selectionNodeHashKeys.forEach((id) => {
      this.selectionNodeHash[id].style.display = '';
    });
    this.sectionNodeHashKeys.forEach((id) => {
      this.sectionNodeHash[id].style.display = '';
    });
    return;
  }

  value = value.toLowerCase();

  var searchWords = value.split(' ');
  var searchChunks = [];
  searchWords.forEach((searchWord) => {
    var chunks = splitWord(searchWord);
    chunks.forEach((chunk) => {
      searchChunks.push(this.index[chunk] || []);
    });
  });

  // since the the indices are sorted, keep track of index locations as we progress
  var indexLocations = [];
  var maxIndexLocations = [];
  searchChunks.forEach((chunk) => {
    indexLocations.push(0);
    maxIndexLocations.push(chunk.length - 1);
  });

  var finalOutput = [];
  for (; indexLocations.length > 0 && indexLocations[0] <= maxIndexLocations[0]; ++indexLocations[0]) {
    // advance indices to be at least equal to first array element
    var terminate = false;
    for (var ii = 1; ii < searchChunks.length; ++ii) {
      while (searchChunks[ii][indexLocations[ii]] < searchChunks[0][indexLocations[0]] &&
             indexLocations[ii] <= maxIndexLocations[ii]) {
        ++indexLocations[ii];
      }
      if (indexLocations[ii] > maxIndexLocations[ii]) {
        terminate = true;
        break;
      }
    }

    if (terminate) {
      break;
    }

    // check element equality
    var shouldAdd = true;
    for (var jj = 1; jj < searchChunks.length; ++jj) {
      if (searchChunks[0][indexLocations[0]] !== searchChunks[jj][indexLocations[jj]]) {
        shouldAdd = false;
        break;
      }
    }

    if (shouldAdd) {
      finalOutput.push(searchChunks[0][indexLocations[0]]);
    }
  }

  // now we have id's that match search query
  this._handleNodeVisbilities(finalOutput);
};

Search.prototype._handleNodeVisbilities = function(shownNodeIds) {
  var shownNodeIdsHash = {};
  var sectionsToNotHideHash = {};
  shownNodeIds.forEach((id) => {
    shownNodeIdsHash[id] = true;
    var node = this.selectionNodeHash[id];
    node.style.display = '';

    // now search for parent sections
    node = node.parentNode;
    while (!node.className.match(/tree-multiselect/)) {
      if (node.className.match(/section/)) {
        var key = Util.getKey(node);
        Util.assert(key || key === 0);
        if (sectionsToNotHideHash[key]) {
          break;
        } else {
          sectionsToNotHideHash[key] = true;
          node.style.display = '';
        }
      }
      node = node.parentNode;
    }
  });

  // hide selections
  this.selectionNodeHashKeys.forEach((id) => {
    if (!shownNodeIdsHash[id]) {
      this.selectionNodeHash[id].style.display = 'none';
    }
  });
  this.sectionNodeHashKeys.forEach((id) => {
    if (!sectionsToNotHideHash[id]) {
      this.sectionNodeHash[id].style.display = 'none';
    }
  });
};

// split word into three letter (or less) pieces
function splitWord(word) {
  if (!word) {
    return [];
  }

  if (word.length < MAX_SAMPLE_SIZE) {
    return [word];
  }

  var chunks = [];
  for (var ii = 0; ii < word.length - MAX_SAMPLE_SIZE + 1; ++ii) {
    chunks.push(word.substring(ii, ii + MAX_SAMPLE_SIZE));
  }
  return chunks;
}

module.exports = Search;
