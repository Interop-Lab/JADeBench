'use strict';

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const cin = input.split(/ |\n/);
let cid = 0;

function next() {
  return +cin[cid++];
}

function nextstr() {
  return cin[cid++];
}

function nextbig() {
  return BigInt(cin[cid++]);
}

function nexts(n, asStrings) {
  if (asStrings) {
    return cin.slice(cid, cid += n);
  }
  return cin.slice(cid, cid += n).map(x => +x);
}

function nextm(rows, cols, asStrings) {
  const result = [];
  for (let i = 0; i < rows; i++) {
    if (asStrings) {
      result.push(cin.slice(cid, cid += cols));
    } else {
      result.push(cin.slice(cid, cid += cols).map(x => +x));
    }
  }
  return result;
}

function xArray(...args) {
  const n = args.length;
  let expr = 'Array(' + (n - 1) + ').fill().map(x=>' + args[0] + ')';
  for (let i = 1; i < n; i++) {
    expr = 'Array(' + (n - i - 1) + ').fill().map(x=>' + expr + ')';
  }
  return eval(expr);
}

const tm = +new Date() + 900;

const myOut = main();
if (myOut !== undefined) {
  console.log(String(myOut));
}

function main() {
  const [a, b, c] = nexts(3);
  let count = 0;
  while (new Date() < tm) {
    if (a % 2 || b % 2 || c % 2) {
      return count;
    }
    const newA = (b + c) >> 1;
    const newB = (a + c) >> 1;
    const newC = (a + b) >> 1;
    a = newA;
    b = newB;
    c = newC;
    count++;
  }
  return -1;
}
