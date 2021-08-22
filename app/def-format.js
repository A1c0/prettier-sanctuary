const {splitOnEoLNotIgnored} = require("./ignore-line");
const {mapOnLines} = require("./ignore-line");
const {joinNotIgnored} = require("./ignore-line");
const {pipe} = require("./utils");
const {space} = require("./common");

const getIndentOfFistLine = lines => /^([ ]*).*$/.exec(lines.split('\n')[0] || '')[1].length;

const inlineDef = s => {
  const defToInlines = [...s.matchAll(/^(.*?) def \(.*?(\n.*?)*;/gm)].map(x => x[0])
    .filter(x => x.includes("\n"))
    .map(i => [i,  i.replaceAll(',', ', ')
                    .replaceAll(/\n[ ]*/g, '')
                    .replaceAll(')(', ') (')
                    .replace(/^(.*\[.*)(, ])(.*)$/, '$1]$3')
                    .replaceAll(/ +/g, ' ')
                    .replace(/^ /, space(getIndentOfFistLine(i)))
              ]);
  let sCopy = s;
  for (const [beforeFormat, afterFormat] of defToInlines) {
    sCopy = sCopy.replace(beforeFormat, afterFormat);
  }
  return sCopy;
}

const nbOf = c => s => s.split('').filter(x => x === c).length
const haveClosedBracket = s => (nbOf('(')(s) === nbOf(')')(s)) && (nbOf('[')(s) === nbOf(']')(s));

const splitDef = s => s.split(' ').reduce((acc, value) => {
  const last = acc[acc.length - 1];
  if (last && !haveClosedBracket(last)) {
    acc[acc.length - 1] = `${last} ${value}`;
    return acc;
  } else {
    acc.push(value)
    return acc;
  }
}, []);

const wrapDef = s => {
  const regex = /^(.*?def )(\(.*\)) (\(.*\)) (\(.*\)) (\(.*\);)$/;
  if (!regex.test(s)) {
    return s;
  }
  const tab = splitDef(s);
  const indexOnDef = tab.indexOf("def") + 1;
  const base = tab.slice(0, (indexOnDef)).join(' ').concat(' ');
  const [first, ...tail] = tab.slice(indexOnDef);

  return [base.concat(first), ...tail.map(s => `${space(base.length)}${s}`)].join('\n');
};

const defFormat = pipe([
  joinNotIgnored,
  mapOnLines(inlineDef),
  splitOnEoLNotIgnored,
  mapOnLines(wrapDef)
]);

module.exports = {defFormat}
