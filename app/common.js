const {pipe, join} = require("./utils");

const space = pipe([
  x => Array(x).fill(' '),
  join('')
]);

module.exports = {space}
