const prettier = require("prettier");
const fs = require("fs");

const applyPrettier = (filePath, options) =>  {
  const text = fs.readFileSync(filePath, 'utf8');
  return prettier.format(text, Object.assign({parser:"babel"}, options));
};

module.exports = {applyPrettier};
