const fs = require("fs");
const path = require("path");
const {globToRegex} = require("../lib/glob");
const {dirGlobToRegex} = require("./glob");

const defaultIfThrow = (defaultValue, fn) => x =>{
  try {
    return fn(x);
  } catch (e) {
    return defaultValue;
  }
}

const isDirectory = defaultIfThrow(false, s => fs.lstatSync(s).isDirectory());
const isFile = defaultIfThrow(false, s => fs.lstatSync(s).isFile());

const listAllFilesInDir = (dirPath) => {
  const elems = fs.readdirSync(dirPath).map(x => path.resolve(dirPath, x));
  return elems.map(s => isDirectory(s) ? listAllFilesInDir(s): s).flat(Infinity);
}

const isMatchDependOnFsType = (fileRegex, dirRegex) => x => isFile(x)
  ? fileRegex.test(x)
  : isDirectory(x)
    ? dirRegex.test(x)
    : false;

const buildRegexes = glob => {
  const dirGlob = glob.replace(/\/.*?\..*?/, '');
  return glob === dirGlob
    ? {fileRegex: /.*/, dirRegex: dirGlobToRegex(dirGlob)}
    : {fileRegex: globToRegex(glob), dirRegex: dirGlobToRegex(dirGlob)}
};

const listAllFilesByGlob = (dirPath, glob) => {
  const {fileRegex, dirRegex} = buildRegexes(glob);

  const elems = fs.readdirSync(dirPath)
    .map(x => path.resolve(dirPath, x))
    .filter(isMatchDependOnFsType(fileRegex, dirRegex));
  return elems.map(s => isDirectory(s) ? listAllFilesInDir(s): s).flat(Infinity);
}

const listFiles = s => isFile(s)
  ? [path.resolve(process.cwd(), s)]
  : isDirectory(s)
    ? listAllFilesInDir(s)
    : listAllFilesByGlob(process.cwd(), s);

module.exports = {listFiles}
