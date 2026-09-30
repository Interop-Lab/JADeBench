'use strict';
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8');
const lines = input.split('\n');
const str = lines[0];
const n = str.length - 1;

function dfs(i, sum, expr) {
  if (i === n) {
    return eval(expr + str[n]) === 7 ? expr + str[n] : '';
  }
  const plus = dfs(i + 1, sum, expr + str[i] + '+');
  return plus ? plus : dfs(i + 1, sum, expr + str[i] + '-');
}

const ans = dfs(0, 0, '');
console.log(ans ? ans + '=7' : '');
