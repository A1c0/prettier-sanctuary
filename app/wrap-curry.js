const {mapOnLines, splitOnEoLNotIgnored} = require("./ignore-line");
const {when, concat, pipe, flip, replaceAll, MAX_LENGTH, INDENT} = require("./utils");
const {space} = require("./common");

const SUBSTITUTE_BEGIN_PARENTHESIS = '█';
const SUBSTITUTE_END_PARENTHESIS = '▓';

const splitOnParenthesis = pipe([
  JSON.stringify,
  replaceAll("(")('", ["(", "'),
  replaceAll(")")('", ")"], "'),
  flip(concat)("["),
  concat("]"),
  JSON.parse,
]);

const initArray = a => Array.isArray(a) ? a : Array.of(a);

const joinDeepString = t => a => initArray(a).flat(Infinity).join(t);
const concatDeepString = a => joinDeepString('')(a);

const needToBeWrapped = x => Math.max(...(x.split("\n").map(l => l.length))) >= MAX_LENGTH && /^.*\(.*\) \(.*\).*$/.test(x);

const replaceFirstAndLastParenthesisBySubstitute = l => {
  const arr = l.split('');
  arr[l.indexOf('(')] = SUBSTITUTE_BEGIN_PARENTHESIS;
  arr[l.lastIndexOf(')')] = SUBSTITUTE_END_PARENTHESIS;
  return arr.join('');
}

const wrapLine = (line) => {
  const workingLine = /^ *\(.*?$/.exec(line) ? replaceFirstAndLastParenthesisBySubstitute(line) : line;
  const array = splitOnParenthesis(workingLine);
  let [head, ...tail] = array.map(concatDeepString).filter(x => (Boolean(x.trim())));
  const newTail = tail.slice(1).map(x => `${space(head.length)}${x}`)
  head = `${head}${tail[0] || ''}`;
  return [head, ...newTail].flatMap(x => needToBeWrapped(x) ?
    line === x ?
      wrapLine(replaceFirstAndLastParenthesisBySubstitute(x)) :
      wrapLine((x)) :
    x);
}

const isDeclarationTooLong = arr => {
  const isDeclaration = arr[0].includes(" = ");
  const eachLineIsTooLong = arr.map(x => x.length >= MAX_LENGTH).reduce((a, b) => a || b);
  return isDeclaration && eachLineIsTooLong;
}

const wrapDeclaration = arr => {
  const [currentHead, ...currentTail] = arr;
  const newHead = currentHead.replace(/^(.* = ).*?$/, "$1");
  const headRest = currentHead.replace(/^.* = (.*?)$/, "$1").replace (/^/,space(INDENT));
  const newTail = [headRest, ...currentTail.map(l => l.slice(newHead.length - INDENT))];
  return [newHead, ...newTail];
}

const wrapLineDeep = x => {
  let text = wrapLine(x);
  if (isDeclarationTooLong(text)) {
    text = wrapDeclaration(text);
  }
  text = text.join('\n');
  text = text.replaceAll(SUBSTITUTE_END_PARENTHESIS, ')')
    .replaceAll(SUBSTITUTE_BEGIN_PARENTHESIS, '(')
    .replaceAll(/\n *([\);,])/g, "$1");
  return text;
};

const wrapCurry = pipe([
  mapOnLines(when(needToBeWrapped)(wrapLineDeep)),
  splitOnEoLNotIgnored,
]);

module.exports = {wrapCurry};
