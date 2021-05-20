const {split, flatten} = require("./utils");

const ignoredLine = line => ({
  line,
  ignored: true
});

const notIgnoredLine = line => ({
  line,
  ignored: false
});

const addIgnoreLines = lines => {
  const result = [];
  let i = 0;
  while (i < lines.length) {
    if (/^\/\/ prettier-sanctuary-ignore$/.test(lines[i])) {
      result.push(ignoredLine(lines[i]));
      do {
        i++;
        result.push(ignoredLine(lines[i]));
      } while (!(/^.*;$/.test(lines[i])))
    } else if (/^ *\/\*$/.test(lines[i])) {
      result.push(ignoredLine(lines[i]));
      do {
        i++;
        result.push(ignoredLine(lines[i]));
      } while (!(/^.*\*\/$/.test(lines[i])))
    } else if (/^ *\/\/.*$/.test(lines[i])) {
      result.push(ignoredLine(lines[i]));
    } else {
      result.push(notIgnoredLine(lines[i]));
    }
    i++;
  }
  return result;
}

const joinNotIgnored = lines => {
  const result = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i]?.ignored === false) {
      let str = lines[i].line;
      i++;
      while (lines[i]?.ignored === false) {
        str += '\n' + lines[i].line;
        i++;
      }
      result.push(notIgnoredLine(str));
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  return result;
}

const mapOnLines = fn => lines => {
  const result = [];
  for (const line of lines) {
    if (line.ignored === false) {
      const subRes = fn(line.line);
      if (typeof subRes === 'string') {
        result.push(notIgnoredLine(subRes));
      } else if (Array.isArray(subRes)) {
        result.push(subRes.map(notIgnoredLine));
      }
    } else {
      result.push(line);
    }
  }
  return flatten(result);
}

const splitOnEoLNotIgnored = lines => mapOnLines(split('\n'))(lines);


module.exports = {addIgnoreLines, joinNotIgnored, splitOnEoLNotIgnored, mapOnLines}
