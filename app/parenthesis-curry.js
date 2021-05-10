const {replaceAll, pipe} = require("./utils");

const parenthesisCurry = pipe([
  replaceAll(/(\n[ ]*\))/g)(')'),
  replaceAll(/(\(\n[ ]*)/g)('('),
  replaceAll(/([^ ])(\()/g)('$1 (')
]);

module.exports = {parenthesisCurry}
