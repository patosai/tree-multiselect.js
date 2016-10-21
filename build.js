#!/usr/bin/env node

console.log("Building bundle");
var fs = require("fs");
var browserify = require("browserify");
browserify("./src/tree-multiselect.js")
  .transform("babelify", {presets: ["es2015"]})
  .bundle()
  .pipe(fs.createWriteStream("tmp/jquery.tree-multiselect.js"));
