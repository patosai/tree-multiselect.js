## jQuery Tree Multiselect
[![Build Status](https://travis-ci.org/patosai/tree-multiselect.js.svg?branch=master)](https://travis-ci.org/patosai/tree-multiselect.js)
[![Coverage Status](https://coveralls.io/repos/patosai/tree-multiselect.js/badge.svg?branch=master&service=github)](https://coveralls.io/github/patosai/tree-multiselect.js?branch=master)
[![devDependency Status](https://david-dm.org/patosai/tree-multiselect.js/dev-status.svg)](https://david-dm.org/patosai/tree-multiselect.js#info=devDependencies)


**This plugin allows you to replace a `select` element with a sweet treeview element.**

* Requires jQuery v1.8+
* Does not work on IE8. Pull requests welcome!

### Demo
<a target="_blank" href="http://www.patosai.com/projects/tree-multiselect">My website has a simple demo running.</a>

### Usage
```
$("select").treeMultiselect();
```

Option Attribute name         | Description
----------------------------- | ---------------------------------
`data-section` **(required)** | The section the option will be in; can be nested
`data-description`            | A description of the attribute; will be shown on the multiselect
`data-index`                  | For pre-selected options, display options in this order, lowest index first

Your `data-section` can have multiple section names, separated by the `sectionDelimiter` option.

Ex. `data-section="top/middle/inner"` will show up as
- `top`
  - `middle`
    - `inner`
      - your option

#### Options
You can pass in options like `treeMultiselect(options)`. It is an object where you can set the following features:

Option name             | Default | Description
----------------------- | ------- | ---------------
`allowBatchSelection`   | true    | Sections have checkboxes which when checked, check everything within them
`collapsible`           | true    | Adds collapsibility to sections
`freeze`                | false   | Disables selection/deselection of options; aka display-only
`hideSidePanel`         | false   | Hide the right panel showing all the selected items
`onChange`              | null    | Callback for when select is changed. Called with (allSelectedItems, addedItems, removedItems), each of which is an array of objects with the properties `text`, `value`, `initialIndex`, and `sectionName`
`onlyBatchSelection`    | false   | Only sections can be checked, not individual items
`sortable`              | false   | Selected options can be sorted by dragging (requires jQuery UI)
`sectionDelimiter`      | `/`     | Separator between sections in the select option `data-section` attribute
`showSectionOnSelected` | true    | Show section name on the selected items
`startCollapsed`        | false   | Activated only if `collapsible` is true; sections are collapsed initially

### Installation
Load `jquery.tree-multiselect.min.js` on to your web page. The css file is optional (but recommended).

### Custom styling
So, you want to exercise your css-fu. Alright then.

The plugin adds a `div.tree-multiselect` immediately after the specified `select`. The hierarchy is shown below.

- `div.tree-multiselect`
  - `div.selections`
    - a lot of `div.section`, each of which has
      - `div.title`, which has
        - `span.collapse-section` holding the collapsible indicators if collapsibility is enabled
        - `input` of type `checkbox` for selection if allowBatchSelection is enabled
        - the title text
      - a lot of `div.item`, containing
        - `input` of type `checkbox` for selection
        - the item text
      - and possibly more `div.section`
  - `div.selected`
    - a lot of `div.item`, each containing...
      - `span.remove-selected` holding the indicator to remove element from selection
      - the option name
      - `span.section-name` if `showSectionOnSelected` is enabled, showing the section name(s)

### Testing
  1. `npm install`
  2. Now I hope you've got `grunt-cli` installed in some place you know about, because we're about to...
  3. `grunt`
  4. `huff and puff` the tests go
  5. The mettle of your code shall tested in the Battles of QUnit. Shall the dragon be slain and the damsel rescued, from the ashes will rise a green trophy, emblazoned on it the shield of `OK`, a legendary paladin enshrined in the kingdom halls.
  6. But that probably won't happen. If not, the Architect will fire up another simulation and you shall patch your hero's weaknesses.

### License
MIT licensed.
