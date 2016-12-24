var Util = require('./utility');

var index = {}; // key: at most three-letter combinations, value: array of data-key
var nodeHash = {}; // key: data-key, value: DOM node
var nodeHashKeys = [];

const SAMPLE_SIZE = 3;

function addToIndex(key, id) {
  for (var ii = 1; ii <= SAMPLE_SIZE; ++ii) {
    for (var jj = 0; jj < key.length - ii + 1; ++jj) {
      var minikey = key.substring(jj, jj + ii);

      if (!index[minikey]) {
        index[minikey] = [];
      }

      // don't duplicate
      // this takes advantage of the fact that the minikeys with same id's are added sequentially
      var length = index[minikey].length;
      if (length === 0 || index[minikey][length - 1] !== id) {
        index[minikey].push(id);
      }
    }
  }
}

// split word into three letter (or less) pieces
function splitWord(word) {
  if (!word) {
    return [];
  }

  if (word.length < SAMPLE_SIZE) {
    return [word];
  }

  var chunks = [];
  for (var ii = 0; ii < word.length - SAMPLE_SIZE + 1; ++ii) {
    chunks.push(word.substring(ii, ii + SAMPLE_SIZE));
  }
  return chunks;
}

function buildIndex(options, inNodeHash) {
  // options are sorted by id already
  // trigrams
  for (var ii = 0; ii < options.length; ++ii) {
    var option = options[ii];
    var searchWords = Util.array.removeFalseyExceptZero([option.value, option.text, option.description, option.section]);
    for (var jj = 0; jj < searchWords.length; ++jj) {
      var words = searchWords[jj].split(' ');
      for (var kk = 0; kk < words.length; ++kk) {
        addToIndex(words[kk], option.id);
      }
    }
  }
  nodeHash = inNodeHash;
  nodeHashKeys = Object.keys(inNodeHash);
}

function search(value) {
  if (!value) {
    for (var ii = 0; ii < nodeHashKeys.length; ++ii) {
      var id = nodeHashKeys[ii];
      nodeHash[id].style.display = '';
    }
    return;
  }

  var searchWords = value.split(' ');
  var searchChunks = [];
  for (var ii = 0; ii < searchWords.length; ++ii) {
    var chunks = splitWord(searchWords[ii]) ;
    for (var jj = 0; jj < searchWords.length; ++jj) {
      var chunk = chunks[jj];
      searchChunks.push(index[chunk] || []);
    }
  }

  // since the the indices are sorted, keep track of index locations as we progress
  var indexLocations = [];
  var maxIndexLocations = [];
  for (var ii = 0; ii < searchChunks.length; ++ii) {
    indexLocations.push(0);
    maxIndexLocations.push(searchChunks[ii].length - 1);
  }

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
    for (var ii = 1; ii < searchChunks.length; ++ii) {
      if (searchChunks[0][indexLocations[0]] !== searchChunks[ii][indexLocations[ii]]) {
        shouldAdd = false;
        break;
      }
    }

    if (shouldAdd) {
      finalOutput.push(searchChunks[0][indexLocations[0]]);
    }
  }

  // now we have id's that match search query
  var finalOutputHash = {};
  for (var ii = 0; ii < finalOutput.length; ++ii) {
    var id = finalOutput[ii];
    finalOutputHash[id] = true;
    nodeHash[id].style.display = '';
  }
  var allIds = nodeHashKeys;
  for (var ii = 0; ii < nodeHashKeys.length; ++ii) {
    var id = nodeHashKeys[ii];
    if (!finalOutputHash[nodeHashKeys[ii]]) {
      nodeHash[id].style.display = 'none';
    }
  }
}

module.exports = {
  buildIndex: buildIndex,
  search: search
};
