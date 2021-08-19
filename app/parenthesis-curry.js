const {joinNotIgnored, splitOnEoLNotIgnored, mapOnLines} = require("./ignore-line");
const {replaceAll, pipe, INDENT} = require("./utils");
const {space} = require("./common");

const getIndent = line => /^([ ]*).*$/.exec(line || '')[1];

const min = min => value => value < min ? min : value;

const fixIndent = beforeFormat => afterFormat => {

  const beforeFormatArray = beforeFormat.split("\n").map(line =>line.trim());
  const afterFormatArray = afterFormat.split("\n");

  const indexStartToFix = afterFormatArray.map((value, index) => [index, value])
                                          .filter(([i, line]) => !beforeFormatArray.includes(line.trim()))
                                          .filter(([i, line]) => /^.*[\[{]$/.test(line) || /^.*=>$/.test(line))
                                          .map(([index, line]) => index);

  const indexStartToFixReversed = indexStartToFix.reverse();
  console.log(indexStartToFixReversed);
  for (const i of indexStartToFixReversed) {
    const indent = getIndent(afterFormatArray[i +1])
    let j = 0;
    const nbOfIndent = ((indent.length - getIndent(afterFormatArray[i]).length)/ INDENT) - 1;
    while (getIndent(afterFormatArray[i +1 +j]) >= indent){
      const innerIndent =getIndent(afterFormatArray[i +1+j])
      const nbFixIndent = min(0)(innerIndent.length - (INDENT* nbOfIndent));
      const fixIndent = space(nbFixIndent);
      afterFormatArray[i +1 +j] = afterFormatArray[i +1 +j].replace(/(^[ ]*)(.*)$/, `${fixIndent}$2`)
      j++;
    }
    const fixIndentFinish = space(min(0)(indent.length - (INDENT* nbOfIndent) - INDENT));
    afterFormatArray[i +1 +j] = afterFormatArray[i +1 +j].replace(/(^[ ]*)(.*)$/, `${fixIndentFinish}$2`)
  }
  return afterFormatArray.join('\n');
};

const _parenthesisCurry = s => pipe([
  replaceAll (/(\n *\))/g) (')'),
  replaceAll (/(\(\n *)/g) ('('),
  replaceAll (/\)[\n ]*\(/g) (')('),
  fixIndent (s),
  replaceAll (/([^ ])(\()/g) ('$1 ('),
])(s);

const parenthesisCurry = pipe([
  joinNotIgnored,
  mapOnLines(_parenthesisCurry),
  splitOnEoLNotIgnored,
]);

module.exports = {parenthesisCurry}
