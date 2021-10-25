const {pipe, replaceAll} = require("../app/utils");

const SUBSTITUTE_MULTI_DIR = '█';
const SUBSTITUTE_SOMETHING = '▓';

const escapeRegExp = (string) => string.replace(/[\\\/]/g, '\\$&');

const groupFormat = (match, p1) => `(${replaceAll(',')('|')(p1)})`;

const globToRegex = s => pipe([
  replaceAll('/**')(SUBSTITUTE_MULTI_DIR),
  replaceAll('*')(SUBSTITUTE_SOMETHING),
  replaceAll(/{(.*?)}/g)(groupFormat),
  escapeRegExp,
  replaceAll(SUBSTITUTE_SOMETHING)('[^\\/.]+'),
  replaceAll(SUBSTITUTE_MULTI_DIR)('(\\/([^\\/.])+)*'),
  s => new RegExp(s)
]) (s);

const setOptionalPath = str => {
  const array = str.split('\\/');
  if (array.length === 1) {
    return str;
  }
  return array.reverse().reduce((acc, b) => `${b}(\\/${acc})?`)
};

const dirGlobToRegex = s => pipe([
  replaceAll('/**')(SUBSTITUTE_MULTI_DIR),
  replaceAll('*')(SUBSTITUTE_SOMETHING),
  replaceAll(/{(.*?)}/g)(groupFormat),
  escapeRegExp,
  setOptionalPath,
  replaceAll(SUBSTITUTE_SOMETHING)('[^\\/.]+'),
  replaceAll(SUBSTITUTE_MULTI_DIR)('(\\/([^\\/.])+)*'),
  s => new RegExp(s)
]) (s);

module.exports = {globToRegex, dirGlobToRegex};
