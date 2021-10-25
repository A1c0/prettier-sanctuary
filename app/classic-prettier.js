const prettier = require("prettier");
const fs = require("fs");

const applyPrettier = (filePath, options) =>  {
  const text = fs.readFileSync(filePath, 'utf8');
  const formattedText = prettier.format(text, Object.assign({parser:"babel"}, options));
  fs.writeFileSync(filePath, formattedText);
};

module.exports = {applyPrettier};
