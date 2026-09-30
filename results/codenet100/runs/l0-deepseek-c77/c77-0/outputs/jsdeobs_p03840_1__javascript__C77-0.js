'use strict';
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const cin = input.split(/ |\n/);
let cid = 0;

function next(token) {
  return token ? cin[cid++] : +cin[cid++];
}

function nexts(count, asStrings) {
  if (asStrings) {
    return cin.slice(cid, cid += count);
  }
  return cin.slice(cid, cid += count).map(x => +x);
}

function nextm(rows, cols, asStrings) {
  const result = [];
  if (asStrings) {
    for (let i = 0; i < rows; i++) {
      result.push(cin.slice(cid, cid += cols));
    }
  } else {
    for (let i = 0; i < rows; i++) {
      result.push(cin.slice(cid, cid += cols).map(x => +x));
    }
  }
  return result;
}

function xArray(value) {
  const args = arguments;
  let depth = args.length;
  let expression = 'Array(' + --depth + ').fill().map(x=>{return ' + value + '})';
  while (--depth) {
    expression = 'Array(' + depth + ').fill().map(x=>{return ' + expression + '})';
  }
  return eval(expression);
}

function main() {
  const values = nexts(7);
  let result = values[1] + ((values[0] / 2 | 0) + (values[3] / 2 | 0) + (values[4] / 2 | 0) + 2);
  switch ((values[0] % 2) + (values[3] % 2) + (values[4] % 2)) {
    case 3:
      result += 3;
      break;
    case 2:
      if ((values[0] + values[3] + values[4]) % 2 === 0) {
        result += 1;
      }
      break;
  }
  return result;
}

const myOut = main();
if (myOut !== undefined) {
  console.log(myOut);
}
