const {map, join, when, split, concat, pipe, flip, replaceAll, flatten, MAX_LENGTH} = require("./utils");
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
  const s1 = strings.join('\n');
  return s1;
};

const wrapAllPipe = pipe([
  split('\n'),
  map(wrapDef),
  join('\n'),
])

const defFormat = pipe([
  inlineDef,
  wrapAllPipe
]);

module.exports = {defFormat}
