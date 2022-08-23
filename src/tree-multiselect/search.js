let Util = require('./utility');

const MAX_SAMPLE_SIZE = 3;

function Search (searchHitAttr, astItems, astSections, searchParams) {
  this.searchHitAttr = searchHitAttr;
  this.index = {}; // key: at most three-letter combinations, value: array of data-key

  // key: data-key, value: DOM node
  this.astItems = astItems;
  this.astItemKeys = Object.keys(astItems);

  this.astSections = astSections;
  this.astSectionKeys = Object.keys(astSections);

  this.setSearchParams(searchParams);

  this.buildIndex();
}

Search.prototype.setSearchParams = function (searchParams) {
  Util.assert(Array.isArray(searchParams));

  let allowedParams = {
    value: true,
    text: true,
    description: true,
    section: true
  };

  this.searchParams = [];
  for (let ii = 0; ii < searchParams.length; ++ii) {
    if (allowedParams[searchParams[ii]]) {
      this.searchParams.push(searchParams[ii]);
    }
  }
};

Search.prototype.buildIndex = function () {
  // trigrams
  for (const astItemKey in this.astItems) {
    const astItem = this.astItems[astItemKey];
    let searchItems = [];
    this.searchParams.forEach((searchParam) => {
      searchItems.push(astItem[searchParam]);
    });
    Util.array.removeFalseyExceptZero(searchItems);
    let searchWords = searchItems.map((item) => {
      return item.toLowerCase();
    });

    searchWords.forEach((searchWord) => {
      let words = searchWord.split(' ');
      words.forEach((word) => {
        this._addToIndex(word, astItem.id);
      });
    });
  }
};

Search.prototype._addToIndex = function (key, id) {
  for (let sampleSize = 1; sampleSize <= MAX_SAMPLE_SIZE; ++sampleSize) {
    for (let startOffset = 0; startOffset < key.length - sampleSize + 1; ++startOffset) {
      let minikey = key.substring(startOffset, startOffset + sampleSize);

      if (!this.index[minikey]) {
        this.index[minikey] = [];
      }

      // don't duplicate
      // this takes advantage of the fact that the minikeys with same id's are added sequentially
      let length = this.index[minikey].length;
      if (length === 0 || this.index[minikey][length - 1] !== id) {
        this.index[minikey].push(id);
      }
    }
  }
};

Search.prototype.search = function (value) {
  if (!value) {
    this.astItemKeys.forEach((id) => {
      this.astItems[id].removeSearchHitMarker();
    });
    this.astSectionKeys.forEach((id) => {
      this.astSections[id].removeSearchHitMarker();
    });
    return;
  }

  value = value.toLowerCase().trim();

  let searchWords = value.split(' ');
  let searchChunks = [];
  searchWords.forEach((searchWord) => {
    let chunks = splitWord(searchWord);
    chunks.forEach((chunk) => {
      searchChunks.push(this.index[chunk] || []);
    });
  });

  let matchedNodeIds = Util.array.intersectMany(searchChunks);

  // now we have id's that match search query
  this.handleNodeVisibilities(matchedNodeIds);
};

Search.prototype.handleNodeVisibilities = function (shownNodeIds) {
  let shownNodeIdsHash = {};
  let sectionsToNotHideHash = {};
  shownNodeIds.forEach((id) => {
    shownNodeIdsHash[id] = true;
    let node = this.astItems[id].node;

    // now search for parent sections
    node = node.parentNode;
    while (!node.className.match(/tree-multiselect/)) {
      if (node.className.match(/section/)) {
        let key = Util.getKey(node);
        Util.assert(key || key === 0);
        if (sectionsToNotHideHash[key]) {
          break;
        } else {
          sectionsToNotHideHash[key] = true;
        }
      }
      node = node.parentNode;
    }
  });

  // hide selections
  this.astItemKeys.forEach((id) => {
    let isSearchHit = !!shownNodeIdsHash[id];
    this.astItems[id].addSearchHitMarker(isSearchHit);
  });
  this.astSectionKeys.forEach((id) => {
    let isSearchHit = !!sectionsToNotHideHash[id];
    this.astSections[id].addSearchHitMarker(isSearchHit);
  });
};

// split word into three letter (or less) pieces
function splitWord (word) {
  Util.assert(word);

  if (word.length < MAX_SAMPLE_SIZE) {
    return [word];
  }

  let chunks = [];
  for (let ii = 0; ii < word.length - MAX_SAMPLE_SIZE + 1; ++ii) {
    chunks.push(word.substring(ii, ii + MAX_SAMPLE_SIZE));
  }
  return chunks;
}

module.exports = Search;
