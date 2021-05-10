const {when} = require("./utils");
const {flip, concat, flatten, split, slice, pipe, map, join} = require("./utils");

const space = pipe([
  x => Array(x).fill(' '),
  join('')
]);

const prependString = flip(concat);
const nbOf = c => s => s.split('').filter(x => x === c).length
const haveClosedBracket = s => (nbOf('(')(s) === nbOf(')')(s)) && (nbOf('[')(s) === nbOf(']')(s));

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

const extendPipeLine = indent => line => pipe([
  s => (/([ ]*)(.*S\.pipe\(\[)(.*)(]\).*)/).exec(s),
  a => slice(1)(Infinity)(a),
  ([previousIndent, ...elms]) => pipe([
    x => [x[0], map(pipe([concat(','), prependString(space(indent))]))(splitArgs(x[1])), x[2]],
    flatten,
    map(prependString(previousIndent)),
    join('\n')
  ])(elms)
])(line)

const forceExtendPipe = pipe([
  split('\n'),
  map(when(x => /([ ]*)(.*S\.pipe\(\[)(.*)(]\).*)/.test(x))(extendPipeLine(2))),
  join('\n'),
]);

module.exports = {forceExtendPipe};
