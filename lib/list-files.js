const fs = require("fs");
const path = require("path");

const isDirectory = s => {
  try {
    return fs.lstatSync(s).isDirectory()
  }catch (e) {
    return false;
  }
};

const isFile = s => {
  try {
    return fs.lstatSync(s).isFile()
  }catch (e) {
    return false;
  }
};

const listAllFilesInDir = (dirPath) => fs.readdirSync(dirPath).map(f => path.resolve(dirPath, f)).map(s => isDirectory(s) ? listAllFilesInDir(s): s).flat(Infinity);

const listFilesByArgs = args =>
  args.length === 1 && isDirectory(args[0])
    ? listAllFilesInDir(args[0]).map(f => f.replace(process.cwd() + "/", ""))
    : args.filter(isFile);

module.exports = {listAllFilesInDir, listFilesByArgs}
