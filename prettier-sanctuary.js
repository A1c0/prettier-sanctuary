#!/usr/bin/env node
"use strict";
const fs = require("fs");
const { performance } = require("perf_hooks");
const { pipe, split, join, map, INDENT, MAX_LENGTH } = require("./app/utils");
const { addIgnoreLines } = require("./app/ignore-line");
const { defFormat } = require("./app/def-format");
const { forceExtendPipe } = require("./app/force-extend-pipe");
const { parenthesisCurry } = require("./app/parenthesis-curry");
const { wrapCurry } = require("./app/wrap-curry");
const { listFilesByArgs } = require("./lib/list-files");
const COLOR = require("./lib/color");
const prettier = require("prettier");
const path = require("path");
const { applyExceptOnTextGroup } = require("./app/exclude-string-and-regex.js");
const { tap } = require("./app/utils.js");

// customReformat :: {indent: Integer, maxLength: Integer} -> Array {line: String, ignored: Boolean} -> Array {line: String, ignored: Boolean}
const customReformat = ({ indent, maxLength }) =>
  pipe([
    parenthesisCurry(indent),
    forceExtendPipe(indent),
    wrapCurry(maxLength)(indent),
    defFormat,
  ]);

const applySanctuaryFormatting = (config) =>
  applyExceptOnTextGroup((text) =>
    pipe([
      split("\n"), // Array String
      addIgnoreLines, // Array {line: String, ignored: Boolean}
      customReformat(config), // Array {line: String, ignored: Boolean}
      map((x) => x.line), // Array String
      join("\n"), // String
    ])(text)
  );

const formatFile = async (file, appDir, config) => {
  const t0 = performance.now();

  const text = fs.readFileSync(file, "utf8");
  const prettierConfig = {
    ...config,
    parser: "babel",
    pluginSearchDirs: [appDir],
  };
  const textPrettierFormatted = prettier.format(text, prettierConfig);
  const sanctuaryConfig = {
    indent: (config && config.tabWidth) || INDENT,
    maxLength: (config && config.printWidth) || MAX_LENGTH,
  };
  const textSanctuaryFormatted = applySanctuaryFormatting(sanctuaryConfig)(
    textPrettierFormatted
  );

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
  const config = prettier.resolveConfig.sync(process.cwd());
  const appDir =
    path.dirname(prettier.resolveConfigFile.sync(process.cwd())) ??
    process.cwd();
  for (const file of files) {
    await formatFile(file, appDir, config);
  }
};

bash(process.argv.slice(2));
