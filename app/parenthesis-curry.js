const {
  joinNotIgnored,
  splitOnEoLNotIgnored,
  mapOnLines,
} = require("./ignore-line");
const { replaceAll, pipe, INDENT } = require("./utils");
const { space } = require("./common");
const { applyExceptOnTextGroup } = require("./exclude-string-and-regex");

const getIndent = (line) => /^([ ]*).*$/.exec(line || "")[1];

const min = (min) => (value) => value < min ? min : value;

const fixIndent = (indentConfig) => (beforeFormat) => (afterFormat) => {
  const beforeFormatArray = beforeFormat.split("\n").map((line) => line.trim());
  const afterFormatArray = afterFormat.split("\n");

  const indexStartToFix = afterFormatArray
    .map((value, index) => [index, value])
    .filter(([i, line]) => !beforeFormatArray.includes(line.trim()))
    .filter(([i, line]) => /^.*[\[{]$/.test(line) || /^.*=>$/.test(line))
    .map(([index, line]) => index);

  const indexStartToFixReversed = indexStartToFix.reverse();
  for (const i of indexStartToFixReversed) {
    const indent = getIndent(afterFormatArray[i + 1]);
    let j = 0;
    const nbOfIndent =
      (indent.length - getIndent(afterFormatArray[i]).length) / indentConfig -
      1;
    while (getIndent(afterFormatArray[i + 1 + j]) >= indent) {
      const innerIndent = getIndent(afterFormatArray[i + 1 + j]);
      const nbFixIndent = min(0)(
        innerIndent.length - indentConfig * nbOfIndent
      );
      const fixIndent = space(nbFixIndent);
      afterFormatArray[i + 1 + j] = afterFormatArray[i + 1 + j].replace(
        /(^[ ]*)(.*)$/,
        `${fixIndent}$2`
      );
      j++;
    }
    const fixIndentFinish = space(
      min(0)(indent.length - indentConfig * nbOfIndent - indentConfig)
    );
    afterFormatArray[i + 1 + j] = afterFormatArray[i + 1 + j].replace(
      /(^[ ]*)(.*)$/,
      `${fixIndentFinish}$2`
    );
  }
  return afterFormatArray.join("\n");
};

const _parenthesisCurry = (indent) => (s) =>
  pipe([
    replaceAll(/(\n *\))/g)(")"),
    replaceAll(/(\(\n *)/g)("("),
    replaceAll(/\)[\n ]*\(/g)(")("),
    fixIndent(indent)(s),
    replaceAll(/([^ ])(\()/g)("$1 ("),
  ])(s);

const parenthesisCurry = (indent) =>
  pipe([
    joinNotIgnored,
    mapOnLines(applyExceptOnTextGroup(_parenthesisCurry(indent))),
    splitOnEoLNotIgnored,
  ]);

module.exports = { parenthesisCurry };
