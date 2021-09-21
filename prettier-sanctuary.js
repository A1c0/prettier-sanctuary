#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require('path');
const {pipe, tap, split, join, map} = require("./app/utils");
const {addIgnoreLines} = require("./app/ignore-line");
const {defFormat} = require("./app/def-format");
const {forceExtendPipe} = require("./app/force-extend-pipe");
const {parenthesisCurry} = require("./app/parenthesis-curry");
const {wrapCurry} = require('./app/wrap-curry');

const readTextFile = fileName => fs.readFileSync(fileName).toString();
const writeTextFile = fileName => text => fs.writeFileSync(fileName, text);
const isDirectory = path => fs.statSync(path).isDirectory();

// customReformat :: Array {line: String, ignored: Boolean} -> Array {line: String, ignored: Boolean}
const customReformat = pipe([
  parenthesisCurry,
  forceExtendPipe,
  wrapCurry,
  defFormat,
]);

const bash = filePath => pipe([
  readTextFile,     // String
  split('\n'),      // Array String
  addIgnoreLines,   // Array {line: String, ignored: Boolean}
  customReformat,   // Array {line: String, ignored: Boolean}
  map(x => x.line), // Array String
  join('\n'),       // String
  tap(writeTextFile(filePath))
])(filePath);

function formatFilesInTheWholeDirectory ( dir ) {
  fs.readdir(dir, (err, list) => {
    list.forEach( file => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stat) => {
        if (stat.isDirectory()) {
            formatFilesInTheWholeDirectory(filePath);
        } else {
            bash(filePath);
        }
      })
    });
  });
}

const f = process.argv[2];

isDirectory(f) ? formatFilesInTheWholeDirectory(f) : bash(f);
