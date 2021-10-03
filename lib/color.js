// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const COLOR = {};
COLOR.reset = "\x1b[0m";
COLOR.bright = "\x1b[1m";
COLOR.dim = "\x1b[2m";
COLOR.underscore = "\x1b[4m";
COLOR.blink = "\x1b[5m";
COLOR.reverse = "\x1b[7m";
COLOR.hidden = "\x1b[8m";

COLOR.fgBlack = "\x1b[30m";
COLOR.fgRed = "\x1b[31m";
COLOR.fgGreen = "\x1b[32m";
COLOR.fgYellow = "\x1b[33m";
COLOR.fgBlue = "\x1b[34m";
COLOR.fgMagenta = "\x1b[35m";
COLOR.fgCyan = "\x1b[36m";
COLOR.fgWhite = "\x1b[37m";

COLOR.bgBlack = "\x1b[40m";
COLOR.bgRed = "\x1b[41m";
COLOR.bgGreen = "\x1b[42m";
COLOR.bgYellow = "\x1b[43m";
COLOR.bgBlue = "\x1b[44m";
COLOR.bgMagenta = "\x1b[45m";
COLOR.bgCyan = "\x1b[46m";
COLOR.bgWhite = "\x1b[47m";

module.exports = COLOR;
