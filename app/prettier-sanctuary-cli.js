const { pipe, split, map, join, INDENT, MAX_LENGTH } = require("./utils.js");
const { parenthesisCurry } = require("./parenthesis-curry.js");
const { forceExtendPipe } = require("./force-extend-pipe.js");
const { wrapCurry } = require("./wrap-curry.js");
const { defFormat } = require("./def-format.js");
const { addIgnoreLines } = require("./ignore-line.js");
const { applyExceptOnTextGroup } = require("./exclude-string-and-regex.js");
const prettier = require("prettier");

// customReformat :: {indent: Integer, maxLength: Integer} -> Array {line: String, ignored: Boolean} -> Array {line: String, ignored: Boolean}
const customReformat = ({ indent, maxLength }) =>
  pipe([
    parenthesisCurry(indent),
    forceExtendPipe(indent),
    wrapCurry(maxLength)(indent),
    defFormat,
  ]);

const applySanctuaryFormatting = (config) => (text) =>
  pipe([
    split("\n"), // Array String
    addIgnoreLines, // Array {line: String, ignored: Boolean}
    applyExceptOnTextGroup(customReformat(config)), // Array {line: String, ignored: Boolean}
    map((x) => x.line), // Array String
    join("\n"), // String
  ])(text);

const getConfiguration = () => {
  try {
    const config = prettier.resolveConfig.sync(process.cwd()) || {};
    return {
      indent: config.tabWidth || INDENT,
      maxLength: config.printWidth || MAX_LENGTH,
    };
  } catch (e) {
    return {
      indent: INDENT,
      maxLength: MAX_LENGTH,
    };
  }
};

module.exports = {
  applySanctuaryFormatting,
  getConfiguration,
};
