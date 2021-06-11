const {mapOnLines, splitOnEoLNotIgnored} = require("./ignore-line");
const {flip, concat, flatten, pipe, INDENT} = require("./utils");
const {space} = require("./common");

const prependString = flip(concat);
const nbOf = c => s => s.split('').filter(x => x === c).length
const haveClosedBracket = s => (nbOf('(')(s) === nbOf(')')(s)) && (nbOf('[')(s) === nbOf(']')(s));

const pipeRegex = /( *)(.*?S\.pipeK? \(\[)(.*?)(]\).*)/;

const splitArgs = s => s.split(', ').reduce((acc, value) => {
  const last = acc[acc.length - 1];
  if (last && !haveClosedBracket(last)) {
    acc[acc.length - 1] = `${last}, ${value}`;
    return acc;
  } else {
    acc.push(value)
    return acc;
  }
}, []);

const extendPipeLine = indent => line => {
  if (!pipeRegex.test(line)) {
    return line;
  }
  const [previousIndent, pipeBegin, args, pipeEnd] = pipeRegex.exec(line).splice(1);
  const argsArray = splitArgs(args).map(prependString(space(indent)));
  const init = argsArray.slice(0, argsArray.length - 1);
  const last = argsArray[argsArray.length - 1];
  const argsArrayWithComma = flatten([init.map(concat(',')), last]);
  return flatten([pipeBegin, argsArrayWithComma, pipeEnd]).map(prependString(previousIndent)).join('\n');
}

const forceExtendPipe = pipe([
  mapOnLines(extendPipeLine(INDENT)),
  splitOnEoLNotIgnored,
]);

module.exports = {forceExtendPipe};
