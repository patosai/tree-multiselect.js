const SEARCH_HIT_ATTR = 'searchhit';
const SEARCH_HIT_ATTR_VAL_TRUE = 'true';
const SEARCH_HIT_ATTR_VAL_FALSE = 'false';

exports.addSearchHitMarker = function (node, isSearchHit) {
  if (node) {
    isSearchHit = isSearchHit ? SEARCH_HIT_ATTR_VAL_TRUE : SEARCH_HIT_ATTR_VAL_FALSE;
    node.setAttribute(SEARCH_HIT_ATTR, isSearchHit);
  }
};

exports.removeSearchHitMarker = function (node, isSearchHit) {
  if (node) {
    node.removeAttribute(SEARCH_HIT_ATTR);
  }
};

exports.isNotSearchHit = function (node) {
  return node && node.getAttribute(SEARCH_HIT_ATTR) === SEARCH_HIT_ATTR_VAL_FALSE;
};
