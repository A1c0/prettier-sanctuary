const tap = (f) => (x) => (f(x), x);
const pipe = (fnArray) => (value) =>
  fnArray.reduce((result, fn) => fn(result), value);
const filter = (p) => (a) => a.filter(p);
const map = (fn) => (a) => a.map(fn);
const prepend = (e) => (a) => [e, ...a];
const append = (e) => (a) => [...a, e];
const mapExceptHead = (fn) => (a) => [a[0], ...a.splice(1).map(fn)];
const split = (c) => (s) => s.split(c);
const concat = (c) => (s) => s.concat(c);
const flip = (fn) => (b) => (a) => fn(a)(b);
const reduce = (fn) => (b) => (a) => a.reduce(fn, b);
const flatten = (a) => a.flat(Infinity);
const replaceAll = (a) => (b) => (s) => s.replaceAll(a, b);

module.exports = {
  tap,
  pipe,
  filter,
  map,
  prepend,
  append,
  mapExceptHead,
  split,
  concat,
  flip,
  reduce,
  flatten,
  replaceAll,
}
