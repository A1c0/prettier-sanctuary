// prettier-ignore
const tap = (f) => (x) => (f(x), x);
const pipe = (fnArray) => (value) =>
  fnArray.reduce((result, fn) => fn(result), value);
const filter = (p) => (a) => a.filter(p);
const map = (fn) => (a) => a.map(fn);
const prepend = (e) => (a) => [e, ...a];
const append = (e) => (a) => [...a, e];
const mapExceptHead = (fn) => (a) => [a[0], ...a.splice(1).map(fn)];
const mapExceptHeadAndLast = (fn) => (a) =>
  [a[0], ...a.slice(1, a.length - 1).map(fn), a[a.length - 1]];
const split = (c) => (s) => s.split(c);
const concat = (c) => (s) => s.concat(c);
const flip = (fn) => (b) => (a) => fn(a)(b);
const reduce = (fn) => (b) => (a) => a.reduce(fn, b);
const flatten = (a) => a.flat(Infinity);
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const initRegExp = (s) =>
  typeof s === "string" ? new RegExp(escapeRegExp(s), "g") : new RegExp(s, "g");
const replaceAll = (a) => (b) => (s) =>
  typeof s.replaceAll === "function"
    ? s.replaceAll(initRegExp(a), b)
    : s.replace(new RegExp(initRegExp(a), "g"), b);
const replace = (a) => (b) => (s) => s.replace(a, b);

const join = (e) => (a) => a.join(e);
const slice = (a) => (b) => (c) => c.slice(a, b);
const when = (p) => (fn) => (a) => {
  if (p(a)) {
    return fn(a);
  }
  return a;
};

const reverse = (a) => a.reverse();

const INDENT = 2;
const MAX_LENGTH = 80;

module.exports = {
  INDENT,
  MAX_LENGTH,
  tap,
  pipe,
  filter,
  map,
  prepend,
  append,
  mapExceptHead,
  mapExceptHeadAndLast,
  split,
  concat,
  flip,
  reduce,
  flatten,
  replaceAll,
  replace,
  join,
  slice,
  when,
  reverse,
};
