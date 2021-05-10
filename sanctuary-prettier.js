#!/usr/bin/env node
"use strict";
const fs = require("fs");
const {parenthesisCurry} = require("./app/parenthesis-curry");
const {pipe, tap} = require('./app/utils');

const readTextFile = fileName => fs.readFileSync(fileName).toString();
const writeTextFile = fileName => text => fs.writeFileSync(fileName, text);

const customReformat = pipe([
  parenthesisCurry
])

const bash = filePath => pipe([
  readTextFile,
  customReformat,
  tap(writeTextFile(filePath))
])(filePath);

bash(process.argv[2])
