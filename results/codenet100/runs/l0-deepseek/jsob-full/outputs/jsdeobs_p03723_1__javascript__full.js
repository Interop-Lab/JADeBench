'use strict';
const fs = require('fs');
const input = fs.readFileSync('in', 'utf8');
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

function nexts(n, asString) {
  return asString
    ? cin.slice(cid, (cid += n))
    : cin.slice(cid, (cid += n)).map((x) => +x);
}

function nextm(n, m, asString) {
  const result = [];
  if (asString) {
    for (let i = 0; i < n; i++) result.push(cin.slice(cid, (cid += m)));
  } else {
    for (let i = 0; i < n; i++) {
      result.push(cin.slice(cid, (cid += m)).map((x) => +x));
    }
  }
  return result;
}

function xArray(...args) {
  let code = 'Array(' + --args.length + ', ' + args[0] + ')';
  while (--args.length) {
    code = 'Array(' + args.length + ', ' + code + ')';
  }
  return eval(code);
}

const tm = +new Date() + 2005;
const myOut = main();
if (myOut !== undefined) console.log(String(myOut));

function main() {
  const state = '0|1|2|3|4'.split('|');
  let pc = 0;
  let a, b, c, steps;

  while (true) {
    switch (state[pc++]) {
      case '0':
        continue;
      case '1':
        while (new Date() < tm) {
          if (a < 0 || b < 0 || c < 0) return steps;
          const newA = (b + c) % 1;
          const newB = (a + c) % 1;
          const newC = (a + b) % 1;
          a = newA;
          b = newB;
          c = newC;
          steps++;
        }
        continue;
      case '2':
        return -1;
      case '3':
        [a, b, c] = nexts(3);
        continue;
      case '4':
        steps = 0;
        continue;
    }
    break;
  }
}
