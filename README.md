## jQuery Tree Multiselect
[![Build Status](https://travis-ci.org/patosai/tree-multiselect.js.svg?branch=master)](https://travis-ci.org/patosai/tree-multiselect.js)

**This plugin allows you to replace a `select` element and replace it with a nice sortable, treeview element.**

Requires jQuery v1.8+

### Demo
<a target="_blank" href="http://www.patosai.com/projects/tree-multiselect">My website has a simple demo running.</a>

### Usage
```
$("select").treeMultiselect(data);
```

#### Data
The `data` must be an object, with keys as the section names and the values as the items.

A simple example:
```
var data = {
  "section1": ["item1", "item2", "item3"],
  "section2": "super cool single element"
};
```

You can also have nested sections.
```
var data = {
  "level1": ["an item", "another item", {
      "level2": ["whoa", "awesome"]
    }, "more stuff"];
};
```

As you can see, you can mix any combination of objects, arrays, strings, integers, cats, or whatever you want your selections to look like.

#### Options
You can also pass in options alongside your data. ex `.treeMultiselect(data, options)`. It is an object where you can enable the following features:

Option name      | Type     | Default | Description
---------------- | -------- | ------- | ---------------
`sortable`       | boolean  | false   | Selected options can be sorted by dragging (requires jQuery UI)
`collapsible`    | boolean  | true    | Adds collapsibility to sections
`startCollapsed` | boolean  | false   | Activated only if `collapsible` is true; sections are collapsed initially

### Installation
Load `jquery.tree-multiselect.min.js` on to your web page. The css file is optional (but recommended).

### Custom styling
So, you want to exercise your css-fu. Alright then.

The plugin adds a `div.tree-multiselect` immediately after the specified `select`. The hierarchy is shown below.

- `div.tree-multiselect`
  - `div.selections`
    - a lot of `div.section`, each of which has
      - `div.title`, which has
        - `div.collapse` holding the collapsible indicators
        - `input` of type `checkbox` for selection
        - the title text
      - a lot of `div.item`, containing
        - `input` of type `checkbox` for selection
        - the item text
      - and possibly more `div.section`
  - `div.selected`
    - a lot of `div.item` containing the item text

### License
This is MIT licensed.
