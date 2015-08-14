## jQuery Tree Multiselect

**This plugin allows you to replace a `select` element and replace it with a nice sortable, treeview element.**

### Usage
```
$("select").treeMultiselect(data);
```

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

As you can see, you can mix any combination of objects, arrays, strings, integers, cats, or whatever you want your selections as.

### Installation
Put `jquery.tree-multiselect.js` and use it on your web page. The css file is optional and provides only a suggestion of what I envisioned this plugin to be.

### License
This is MIT licensed. Do as you wish :)
