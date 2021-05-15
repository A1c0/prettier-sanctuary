#!/usr/bin/env node
"use strict";
const fs = require("fs");
const {forceExtendPipe} = require("./app/force-extend-pipe");
const {parenthesisCurry} = require("./app/parenthesis-curry");
const {wrapCurry} = require('./app/wrap-curry');
const {pipe, tap} = require('./app/utils');

const readTextFile = fileName => fs.readFileSync(fileName).toString();
const writeTextFile = fileName => text => fs.writeFileSync(fileName, text);

const customReformat = pipe([
  parenthesisCurry,
  forceExtendPipe,
  wrapCurry,
]);

const bash = filePath => pipe([
  readTextFile,
  customReformat,
  tap(writeTextFile(filePath))
])(filePath);

bash(process.argv[2])
