## jQuery Tree Multiselect
[![Build Status](https://travis-ci.org/patosai/tree-multiselect.js.svg?branch=master)](https://travis-ci.org/patosai/tree-multiselect.js)
[![Coverage Status](https://codecov.io/gh/patosai/tree-multiselect.js/branch/master/graph/badge.svg)](https://codecov.io/gh/patosai/tree-multiselect.js)
[![devDependency Status](https://david-dm.org/patosai/tree-multiselect.js/dev-status.svg)](https://david-dm.org/patosai/tree-multiselect.js#info=devDependencies)


**This plugin allows you to add a sweet treeview frontend to a `select` element.**
The underlying `select` element can be used as it was before.

* Requires jQuery v1.8+

### Demo
<a target="_blank" href="http://www.patosai.com/projects/tree-multiselect">My website has a simple demo running.</a>

### Usage
Make sure your `select` has the `multiple` attribute set. Also, make sure you've got `<meta charset="UTF-8">` or some of the symbols may look strange.

#### Options on your select
Option Attribute name         | Description
----------------------------- | ---------------------------------
`selected`                    | Have the option pre-selected. This is actually part of the HTML spec. For specified ordering of these, use `data-index`
`readonly`                    | User cannot modify the value of the option. Option can be selected (ex. `<option selected readonly ...`)
`data-section`                | The section the option will be in; can be nested
`data-description`            | A description of the attribute; will be shown on the multiselect
`data-index`                  | For pre-selected options, display options in this order, lowest index first. Repeated items with the same index will be shown before items with a higher index. Otherwise items will be displayed in the order of the original `select`

All of the above are optional.

Your `data-section` can have multiple section names, separated by the `sectionDelimiter` option.

Ex. `data-section="top/middle/inner"` will show up as
- `top`
  - `middle`
    - `inner`
      - your option

#### The JavaScript
```javascript
$("select").treeMultiselect();
```

And now with some params.
```javascript
$("select").treeMultiselect({searchable: true});
```
```javascript
function treeOnChange(allSelectedItems, addedItems, removedItems) {
  console.log("something changed!");
}

$("select").treeMultiselect({
  allowBatchSelection: false,
  onChange: treeOnChange,
  startCollapsed: true
});
```

The function returns returns an array of objects, each of which contains two functions, `remove` and `reload`. `remove` removes the tree, and `reload` reinitializes the tree from its `select` element. *User-changed options will be lost!*
```javascript
var trees = $("select").treeMultiselect();
var firstTree = trees[0];

// remove the tree
firstTree.remove();

// or, change the select element with new options, then...
firstTree.reload();
```

##### Params
Name                    | Default        | Description
----------------------- | -------------- | ---------------
`allowBatchSelection`   | `true`         | Sections have checkboxes which when checked, check everything within them
`collapsible`           | `true`         | Adds collapsibility to sections
`enableSelectAll`       | `false`        | Enables selection of all or no options
`selectAllText`         | `Select All`   | Only used if `enableSelectAll` is active
`unselectAllText`       | `Unselect All` | Only used if `enableSelectAll` is active
`freeze`                | `false`        | Disables selection/deselection of options; aka display-only
`hideSidePanel`         | `false`        | Hide the right panel showing all the selected items
`onChange`              | `null`         | Callback for when select is changed. Called with (allSelectedItems, addedItems, removedItems), each of which is an array of objects with the properties `text`, `value`, `initialIndex`, and `section`
`onlyBatchSelection`    | `false`        | Only sections can be checked, not individual items
`sortable`              | `false`        | Selected options can be sorted by dragging (requires jQuery UI)
`searchable`            | `false`        | Allows searching of options
`searchParams`          | `['value', 'text', 'description', 'section']` | Set items to be searched. Array must contain `'value'`, `'text'`, or `'description'`, and/or `'section'`
`sectionDelimiter`      | `/`            | Separator between sections in the select option `data-section` attribute
`showSectionOnSelected` | `true`         | Show section name on the selected items
`startCollapsed`        | `false`        | Activated only if `collapsible` is true; sections are collapsed initially

### Installation
Load `jquery.tree-multiselect.min.js` on to your web page. The css file is optional (but recommended).

You can also use bower - `bower install tree-multiselect`

### FAQ
`Help! The first element is selected when I create the tree. How do I make the first element not selected?`
You didn't set the `multiple` attribute on your `select`. This is a property of single-option select nodes - the first option is selected.

### License
MIT licensed.
