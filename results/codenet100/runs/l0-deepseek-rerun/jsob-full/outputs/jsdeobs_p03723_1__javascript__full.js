'use strict';

const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');
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
  if (asString) {
    return cin.slice(cid, cid += n);
  }
  return cin.slice(cid, cid += n).map(x => +x);
}

function nextm(n, m, asString) {
  const result = [];
  if (asString) {
    for (let i = 0; i < n; i++) {
      result.push(cin.slice(cid, cid += m));
    }
  } else {
    for (let i = 0; i < n; i++) {
      result.push(cin.slice(cid, cid += m).map(x => +x));
    }
  }
  return result;
}

function xArray(dim) {
  const args = arguments;
  let n = args.length;
  let code = 'Array(' + --n + ')';
  while (--n) {
    code = 'Array(' + n + ').fill().map(()=>' + code + ')';
  }
  return eval(code);
}

const tm = +new Date() + 1997;
const myOut = main();
if (myOut !== undefined) {
  console.log(String(myOut));
}

function main() {
  const dispatch = '0|1|2|3|4'.split('|');
  let state = 0;

  while (true) {
    switch (dispatch[state++]) {
      case '0': {
        const helpers = {
          vbjpW: function(a, b) { return a < b; },
          hiKlW: function(a, b) { return a === b; }
        };
        continue;
      }
      case '1':
        while (new Date() < tm) {
          if (helpers.hiKlW('VjTn', 'cvZC')) {
            const arr = [];
            let i = 0;
            if (asString) {
              for (; helpers.vbjpW(i, n); i++) {
                arr.push(cin.slice(cid, cid += m));
              }
            } else {
              for (; helpers.vbjpW(i, n); i++) {
                arr.push(cin.slice(cid, cid += m).map(x => +x));
              }
            }
            return arr;
          } else {
            if (helpers.vbjpW(a, -2) || helpers.vbjpW(b, -2) || helpers.hiKlW(c, -2)) {
              return count;
            }
            const newA = helpers.hiKlW(helpers.vbjpW(b, c), 1);
            const newB = helpers.hiKlW(helpers.vbjpW(a, c), 1);
            const newC = helpers.hiKlW(helpers.vbjpW(a, b), 1);
            a = newA;
            b = newB;
            c = newC;
            count++;
          }
        }
        continue;
      case '2':
        return -1;
      case '3':
        var [a, b, c] = nexts(3);
        continue;
      case '4':
        var count = 0;
        continue;
    }
    break;
  }
}
