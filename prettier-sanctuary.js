#!/usr/bin/env node
"use strict";
const fs = require("fs");
const { performance } = require("perf_hooks");
const { listFilesByArgs } = require("./lib/list-files");
const COLOR = require("./lib/color");
const {
  applySanctuaryFormatting,
  getConfiguration,
} = require("./app/prettier-sanctuary-cli.js");

const formatFile = async (file, config) => {
  const t0 = performance.now();

  const text = fs.readFileSync(file, "utf8");
  const textSanctuaryFormatted = applySanctuaryFormatting(config)(text);

  fs.writeFileSync(file, textSanctuaryFormatted);
  const t1 = performance.now();
  console.log(
    COLOR.dim +
      file.replace(`${process.cwd()}/`, "") +
      COLOR.reset +
      ` ${Math.round(t1 - t0)}ms`
  );
};

const bash = async (arg) => {
  const files = listFilesByArgs(arg);
  if (files.length === 0) {
    console.log("Usage: prettier-sanctuary [file/dir/glob ...]");
    process.exit(1);
  }
  const config = getConfiguration();
  for (const file of files) {
    await formatFile(file, config);
  }
};

bash(process.argv.slice(2));
