const getIndexes = (str) => {
  const arr = str.split('');
  const indexesFound = [];
  const isBegin = x => '"\'/`'.includes(x);
  for (let i = 0; i < arr.length; i++){
    const c = arr[i];
    if (isBegin(c)){
      const pair = [i+1];
      i++;
      while (i < arr.length && !(arr[i] === c && arr[i-1] !== '\\')) i++;
      if (i< arr.length) {
        pair.push(i)
        indexesFound.push(pair)
      }
    }
  }
  return indexesFound;
};

const applyReplacementMap = (str, map) => {
  let strC = str;
  Object.entries(map).forEach(([alias, subString]) => {
    strC = strC.replace(subString, alias);
  });
  return strC
}

const unapplyReplacementMap = (str, map) => {
  let strC = str;
  Object.entries(map).forEach(([alias, subString]) => {
    strC = strC.replace(alias, subString);
  });
  return strC
}

const buildReplaceTextObject = s => {
  const map = getIndexes(s)
    .map(([start, end], i) => ({[`REPL${i}`]: s.substring(start, end)}))
    .reduce((acc, value) => Object.assign(acc, value), {});

  return {text : applyReplacementMap(s, map), replaceMap : map}
}

const applyExceptOnTextGroup = fn => s => {
  const obj = buildReplaceTextObject(s);
  obj.text = fn(obj.text);
  return unapplyReplacementMap(obj.text, obj.replaceMap)
}

module.exports = {applyExceptOnTextGroup}
