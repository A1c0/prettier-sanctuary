#!/usr/bin/env node
"use strict";
const fs = require("fs");
const {performance} = require('perf_hooks');
const {pipe, tap, split, join, map} = require("./app/utils");
const {addIgnoreLines} = require("./app/ignore-line");
const {defFormat} = require("./app/def-format");
const {forceExtendPipe} = require("./app/force-extend-pipe");
const {parenthesisCurry} = require("./app/parenthesis-curry");
const {wrapCurry} = require('./app/wrap-curry');
const {listFilesByArgs} = require("./lib/list-files");
const COLOR = require("./lib/color");
const {applyPrettier} = require("./app/classic-prettier");

const readTextFile = fileName => fs.readFileSync(fileName).toString();
const writeTextFile = fileName => text => fs.writeFileSync(fileName, text);

// customReformat :: Array {line: String, ignored: Boolean} -> Array {line: String, ignored: Boolean}
const customReformat = pipe([
  parenthesisCurry,
  forceExtendPipe,
  wrapCurry,
  defFormat,
]);

const applySanctuaryFormattingOnFile = filePath => pipe([
  readTextFile,     // String
  split('\n'),      // Array String
  addIgnoreLines,   // Array {line: String, ignored: Boolean}
  customReformat,   // Array {line: String, ignored: Boolean}
  map(x => x.line), // Array String
  join('\n'),       // String
  tap(writeTextFile(filePath))
])(filePath);


const formatFile = async file =>  {
  const t0 = performance.now();
  await applyPrettier(file)
  applySanctuaryFormattingOnFile(file);
  const t1 = performance.now();
  console.log(COLOR.dim + file.replace(`${process.cwd()}/`, '') + COLOR.reset + ` ${Math.round(t1-t0)}ms`);
}

const bash = async arg => {
  const files = listFilesByArgs(arg);
  if (files.length === 0) {
    console.log("Usage: prettier-sanctuary [file/dir/glob ...]");
    process.exit(1);
  }
  performance.now();
  for (const file of files) {
    await formatFile(file)
  }
}

bash(process.argv.slice(2))
