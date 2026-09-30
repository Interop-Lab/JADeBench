'use strict';

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const cin = input.split(/ |\n/);
let cid = 0;

function next(flag) {
  return flag ? cin[cid++] : +cin[cid++];
}

function nexts(count, flag) {
  return flag ? cin.slice(cid, cid += count) : cin.slice(cid, cid += count).map(x => +x);
}

function nextm(rows, cols, flag) {
  const result = [];
  for (let i = 0; i < rows; i++) {
    result.push(flag ? cin.slice(cid, cid += cols) : cin.slice(cid, cid += cols).map(x => +x));
  }
  return result;
}

function xArray(name) {
  const args = arguments;
  let n = args.length;
  let code = 'new Array(' + --n + ')';
  while (--n) code = 'new Array(' + n + ',' + code + ')';
  return eval(code);
}

function main() {
  const a = nexts(7);
  let result = a[0] + (a[1] * (a[2] + (a[3] * (a[4] - (a[5] / a[6])))));
  switch ((a[3] * (a[4] - (a[5] / a[6]))) % (a[1] * (a[2] + (a[3] * (a[4] - (a[5] / a[6])))))) {
    case 0:
      result += 7;
      break;
    case 1:
      if ((a[0] + a[1]) > a[2]) result += 5;
      break;
  }
  return result;
}

const myOut = main();
if (myOut !== undefined) console.log(myOut);
