const {join, replaceAll, split, pipe, INDENT} = require("./utils");
const {space} = require("./common");

const getIndentNbSpace = array => index => /^([ ]*).*$/.exec(array[index] || '')[1].split('').length;

const min = min => value => value < min ? min : value;

const fixIndentLine = (value, index, array) => {
  const previousValue = array[index-1] || '';
  const previousValue2 = array[index-2] || '';
  const previousIndentNbSpace = getIndentNbSpace(array)(index-1);

  if ((/^.*\[$/.test(previousValue) || /^.*\{$/.test(previousValue) || /^.*=>$/.test(previousValue))) {
    return value.replace(/(^[ ]*)(.*)$/, `${space(previousIndentNbSpace + INDENT)}$2`)
  }

  if (/^[ ]*\].*$/.test(value) || /^[ ]*\}.*$/.test(value)) {
    return value.replace(/(^[ ]*)(.*)$/, `${space(min(0)(previousIndentNbSpace - INDENT))}$2`)
  }

  if (/^.*=>$/.test(previousValue2)) {
    return value.replace(/(^[ ]*)(.*)$/, `${space(min(0)(previousIndentNbSpace - INDENT))}$2`)
  }

  if (/^.*;$/.test(previousValue)) {
    return value.replace(/(^[ ]*)(.*)$/, `${space(0)}$2`)
  }

  return value.replace(/(^[ ]*)(.*)$/, `${space(previousIndentNbSpace)}$2`)
}

const fixEachIndentLine = array => {
  for (let i = 0; i < array.length; i++){
    array[i] = fixIndentLine(array[i], i, array);
  }
  return array;
}

const fixIndent = pipe([
  split("\n"),
  fixEachIndentLine,
  // join("\n")
]);

const parenthesisCurry = pipe([
  replaceAll(/(\n[ ]*\))/g)(')'),
  replaceAll(/(\(\n[ ]*)/g)('('),
  replaceAll(/([^ ])(\()/g)('$1 ('),
  fixIndent,
]);

module.exports = {parenthesisCurry}
