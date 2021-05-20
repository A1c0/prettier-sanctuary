const {splitOnEoLNotIgnored} = require("./ignore-line");
const {mapOnLines} = require("./ignore-line");
const {joinNotIgnored} = require("./ignore-line");
const {map, join, split, pipe} = require("./utils");
const {space} = require("./common");

const inlineDef = s => {
  const defToInlines = [...s.matchAll(/^(.*?) def \(.*?(\n.*?)*;/gm)].map(x => x[0])
    .filter(x => x.includes("\n"))
    .map(i => [i,  i.replaceAll(',', ', ')
      .replaceAll(/\n[ ]*/g, '').replaceAll(')(', ') (').replace(/^(.*\[.*)(, ])(.*)$/, '$1]$3')]);
  let sCopy = s;
  for (const [beforeFormat, afterFormat] of defToInlines) {
    sCopy = sCopy.replace(beforeFormat, afterFormat);
  }
  return sCopy;
}

const wrapDef = s => {
  const regex = /^(.*?def )(\(.*\)) (\(.*\)) (\(.*\)) (\(.*\);)$/;
  if (!regex.test(s)) {
    return s;
  }
  const [base, head, ...tail] = regex.exec(s).slice(1);
  const strings = [`${base}${head}`, ...tail.map(t => `${space(base.length)}${t}`)];
  return strings.join('\n');
};

const defFormat = pipe([
  joinNotIgnored,
  mapOnLines(inlineDef),
  splitOnEoLNotIgnored,
  mapOnLines(wrapDef)
]);

module.exports = {defFormat}
