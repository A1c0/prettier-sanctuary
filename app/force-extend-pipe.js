const {when} = require("./utils");
const {flip, concat, flatten, split, slice, pipe, map, join} = require("./utils");
const {space} = require("./common");

const prependString = flip(concat);
const nbOf = c => s => s.split('').filter(x => x === c).length
const haveClosedBracket = s => (nbOf('(')(s) === nbOf(')')(s)) && (nbOf('[')(s) === nbOf(']')(s));

const pipeRegex = /( *)(.*?S.pipe \(\[)(.*?)(]\).*)/;

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
  const argsArray = splitArgs(args).map(x => `${space(indent)}${x}`);
  return flatten([pipeBegin, argsArray, pipeEnd]).map(x => `${previousIndent}${x}`).join('\n');
}

const forceExtendPipe = pipe([
  split('\n'),
  map(extendPipeLine(2)),
  join('\n'),
]);

module.exports = {forceExtendPipe};
