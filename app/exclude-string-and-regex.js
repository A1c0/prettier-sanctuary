const {
  joinNotIgnored,
  notIgnoredLine,
  splitOnEoLNotIgnored,
} = require("./ignore-line.js");
const getIndexes = (str) => {
  const arr = str.split("");
  const indexesFound = [];
  const isBegin = (x) => "\"'/`".includes(x);
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    if (isBegin(c)) {
      const pair = [i + 1];
      i++;
      while (i < arr.length && !(arr[i] === c && arr[i - 1] !== "\\")) i++;
      if (i < arr.length && i !== pair[0]) {
        pair.push(i);
        indexesFound.push(pair);
      }
    }
  }
  return indexesFound;
};

const buildAlias = (start, end, n) => {
  const label = "REPL";
  const nbOfCharToAdd = Math.max(0, end - start - label.length - `${n}`.length);
  return `${"#".repeat(Math.floor(nbOfCharToAdd / 2))}${label}${n}${"#".repeat(
    Math.ceil(nbOfCharToAdd / 2)
  )}`;
};

const replaceByIndex = (str, start, end, offset, alias) =>
  str.slice(0, start - offset) + alias + str.slice(end - offset);

const applyReplacementMap = (str, indexes, j = 0) => {
  let work = { str: str, offset: 0 };
  indexes.forEach(([start, end], i) => {
    const alias = buildAlias(start, end, i + j);
    work.str = replaceByIndex(work.str, start, end, work.offset, alias);
    work.offset = end - start - alias.length + work.offset;
  });
  return work.str;
};

const unapplyReplacementMap = (str, map) => {
  let strC = str;
  Object.entries(map).forEach(([alias, subString]) => {
    strC = strC.replace(alias, subString);
  });
  return strC;
};

const buildReplaceTextObject = (s, j = 0) => {
  const indexes = getIndexes(s);
  const map = indexes
    .map(([start, end], i) => ({
      [buildAlias(start, end, i + j)]: s.substring(start, end),
    }))
    .reduce((acc, value) => Object.assign(acc, value), {});

  return { text: applyReplacementMap(s, indexes, j), replaceMap: map };
};

const applyExceptOnTextGroup = (fn) => (value) => {
  const array = joinNotIgnored(value);
  let maps = {};
  const arrayReplaced = array.map((e) => {
    if (e.ignored === true) {
      return e;
    }
    const text = buildReplaceTextObject(e.line, Object.keys(maps).length);
    maps = { ...maps, ...text.replaceMap };
    return notIgnoredLine(text.text);
  });
  const computedValues = fn(splitOnEoLNotIgnored(arrayReplaced));

  const results = [];
  for (const lineObj of computedValues) {
    const lineObjC = JSON.parse(JSON.stringify(lineObj));
    if (lineObjC.ignored === false && /REPL/.test(lineObjC.line)) {
      for (const [alias, subString] of Object.entries(maps)) {
        if (lineObjC.line.includes(alias)) {
          lineObjC.line = lineObjC.line.replace(alias, subString);
          delete maps[alias];
        }
      }
    }
    results.push(lineObjC);
  }

  return results;
};

module.exports = { applyExceptOnTextGroup };
