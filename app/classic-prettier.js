const {listFiles} = require("../lib/list-files");
const {exec} = require("child_process");

const isYarnPackageManager = listFiles(process.cwd())
  .map(f => ["yarn.lock", ".yarnrc.yml"].includes(f))
  .reduce((a, b) => a || b, false);

const prettier = isYarnPackageManager ? "yarn prettier" : "prettier";

const execPromise = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
      } else if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    });
  });

const applyPrettierOnFile = file => execPromise(`${prettier} ${file}`)

module.exports = {applyPrettierOnFile}
