const { mapOnLines, splitOnEoLNotIgnored } = require("./ignore-line");
const { when, concat, pipe, flip, replaceAll } = require("./utils");
const { space } = require("./common");

const SUBSTITUTE_BEGIN_PARENTHESIS = "█";
const SUBSTITUTE_END_PARENTHESIS = "▓";

const splitOnParenthesis = pipe([
  JSON.stringify,
  replaceAll("(")('", ["(", "'),
  replaceAll(")")('", ")"], "'),
  flip(concat)("["),
  concat("]"),
  JSON.parse,
]);

const initArray = (a) => (Array.isArray(a) ? a : Array.of(a));

const joinDeepString = (t) => (a) => initArray(a).flat(Infinity).join(t);
const concatDeepString = (a) => joinDeepString("")(a);

const needToBeWrapped = (maxLength) => (x) =>
  Math.max(...x.split("\n").map((l) => l.length)) >= maxLength &&
  /^.*\(.*\) \(.*\).*$/.test(x);

const replaceFirstAndLastParenthesisBySubstitute = (l) => {
  const arr = l.split("");
  arr[l.indexOf("(")] = SUBSTITUTE_BEGIN_PARENTHESIS;
  arr[l.lastIndexOf(")")] = SUBSTITUTE_END_PARENTHESIS;
  return arr.join("");
};

const wrapLine = (maxLength) => (line) => {
  const workingLine = /^ *\(.*?$/.exec(line)
    ? replaceFirstAndLastParenthesisBySubstitute(line)
    : line;
  const array = splitOnParenthesis(workingLine);
  let [head, ...tail] = array
    .map(concatDeepString)
    .filter((x) => Boolean(x.trim()));
  const newTail = tail.slice(1).map((x) => `${space(head.length)}${x}`);
  head = `${head}${tail[0] || ""}`;
  return [head, ...newTail].flatMap((x) =>
    needToBeWrapped(maxLength)(x)
      ? line === x
        ? wrapLine(maxLength)(replaceFirstAndLastParenthesisBySubstitute(x))
        : wrapLine(maxLength)(x)
      : x
  );
};

const isDeclarationTooLong = (maxLength) => (arr) => {
  const isDeclaration = arr[0].includes(" = ");
  const eachLineIsTooLong = arr
    .map((x) => x.length >= maxLength)
    .reduce((a, b) => a || b);
  return isDeclaration && eachLineIsTooLong;
};

const wrapDeclaration = (indent) => (arr) => {
  const [currentHead, ...currentTail] = arr;
  const newHead = currentHead.replace(/^(.* = ).*?$/, "$1");
  const headIndent = newHead.replace(/^( *).*?$/, "$1").length;
  const innerIndent = indent + headIndent;
  const headRest = currentHead
    .replace(/^.* = (.*?)$/, "$1")
    .replace(/^/, space(innerIndent));
  const newTail = [
    headRest,
    ...currentTail.map((l) => l.slice(newHead.length - innerIndent)),
  ];
  return [newHead, ...newTail];
};

const wrapLineDeep = (maxLength) => (indent) => (x) => {
  let text = wrapLine(maxLength)(x);
  if (isDeclarationTooLong(text)) {
    text = wrapDeclaration(indent)(text);
  }
  text = text.join("\n");
  return pipe([
    replaceAll(SUBSTITUTE_END_PARENTHESIS)(")"),
    replaceAll(SUBSTITUTE_BEGIN_PARENTHESIS)("("),
    replaceAll(/\n *([);,])/)("$1"),
  ])(text);
};

const wrapCurry = (maxLength) => (indent) =>
  pipe([
    mapOnLines(
      when(needToBeWrapped(maxLength))(wrapLineDeep(maxLength)(indent))
    ),
    splitOnEoLNotIgnored,
  ]);

module.exports = { wrapCurry };
