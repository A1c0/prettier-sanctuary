const {mapOnLines, splitOnEoLNotIgnored} = require("./ignore-line");
const {map, when, concat, pipe, flip, replaceAll, MAX_LENGTH} = require("./utils");
const {space} = require("./common");

const splitOnParenthesis = pipe([
  JSON.stringify,
  replaceAll("(")('", ["(", "'),
  replaceAll(")")('", ")"], "'),
  flip(concat)("["),
  concat("]"),
  JSON.parse,
]);

const isOnlyArrayOfString = a => a.map(x => typeof x === 'string').reduce((a, b) => a && b);

const concatDeepString = a => {
  if (Array.isArray(a)) {
    if (isOnlyArrayOfString(a)){
      return a.join('')
    }
    return map(concatDeepString)(a).join('')
  } else if (typeof a === 'string') {
    return a
  }
}

const createArray = s => {
  const arr = s.split(") (");
  const head = arr[0]?.concat(`)`);
  const heart = arr.slice(1,arr.length -1 ).map(x => `(${x})`);
  const last = arr[arr.length - 1]?.replace (/^/,'(');

  return [head, ...heart, last].filter(x=> !!x);
}

const min = min => value => value < min ? min : value;

const computeIndexOfIndent = last => {
  const i = /^.*?(\)*)$/.exec(last)[1].length - 1
  const indexs = [...last.matchAll(/\(/g)].map(x => x["index"]).reverse();
  return indexs[i];
}

const forceFixWrapLine = s => createArray(s).reduce((acc, value) => {
  const last = acc[acc.length-1];
  if (last) {
    const indexOfIndent = computeIndexOfIndent(last);
    const indentToAdd = min(0)(indexOfIndent)
    value = `${space(indentToAdd)}${value}`
  }
  acc.push(value);
  return acc;
}, []).join("\n");

const needToBeWrapped = x => x.length >= MAX_LENGTH && /^.*\(.*\) \(.*\).*$/.test(x);

const wrapLine = line => {
  const array = splitOnParenthesis(line);
  let [head, ...tail] = array.map(concatDeepString).filter(x => (Boolean(x.trim())));
  if (tail.length >= 1) {
    tail[tail.length - 2] = `${tail[tail.length - 2]}${tail[tail.length - 1]}`;
    tail = tail.slice(0, tail.length - 1);
  }
  const newTail = tail.slice(1).map(x => `${space(head.length)}${x}`)
  head = `${head}${tail[0] || ''}`;

  return [head, ...newTail].map(x => when(needToBeWrapped)(forceFixWrapLine)(x)).join('\n');
}

const wrapCurry = pipe([
  mapOnLines(when(needToBeWrapped)(wrapLine)),
  splitOnEoLNotIgnored,
]);

module.exports = {wrapCurry};
