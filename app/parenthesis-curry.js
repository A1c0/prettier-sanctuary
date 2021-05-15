const {join, replaceAll, split, pipe, INDENT} = require("./utils");
const {space} = require("./common");

const getIndent = line => /^([ ]*).*$/.exec(line || '')[1];

const min = min => value => value < min ? min : value;

const fixIndent = beforeFormat => afterFormat => {
  const beforeFormatArray = beforeFormat.split("\n").map(s => s.trim());
  const afterFormatArray = afterFormat.split("\n");

  const indexStartToFix = afterFormatArray.map((value, index) => [index, value])
                                          .filter(([i, line]) => !beforeFormatArray.includes(line.trim()))
                                          .filter(([i, line]) => /^.*[\[{]$/.test(line))
                                          .map(([index, line]) => index);
  for (const i of indexStartToFix) {
    const indent = getIndent(afterFormatArray[i +1])
    const nbFixIndent = min(0)(indent.split('').length - INDENT);
    const fixIndent = space(nbFixIndent);
    const fixIndentFinish = space(min(0)(nbFixIndent - INDENT));
    let j = 0;
    while (getIndent(afterFormatArray[i +1 +j]) === indent){
      afterFormatArray[i +1 +j] = afterFormatArray[i +1 +j].replace(/(^[ ]*)(.*)$/, `${fixIndent}$2`)
      j++;
    }
    afterFormatArray[i +1 +j] = afterFormatArray[i +1 +j].replace(/(^[ ]*)(.*)$/, `${fixIndentFinish}$2`)
  }
  return afterFormatArray.join('\n');
}

const parenthesisCurry = s => pipe([
  replaceAll(/(\n[ ]*\))/g)(')'),
  replaceAll(/(\(\n[ ]*)/g)('('),
  fixIndent(s),
  replaceAll(/([^ ])(\()/g)('$1 ('),
])(s);

module.exports = {parenthesisCurry}
