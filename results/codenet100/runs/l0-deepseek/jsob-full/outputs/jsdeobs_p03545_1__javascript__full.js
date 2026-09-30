'use strict';
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf8').split('\n');
const str = lines[0];
const n = str.length - 1;
const dfs = (i, target, expr) => {
  if (i === n) {
    return eval(expr + str[n]) === target ? expr + str[n] : '';
  }
  const plus = dfs(i + 1, target, expr + str[i] + '+');
  if (plus) return plus;
  return dfs(i + 1, target, expr + str[i] + '-');
};
const ans = dfs(0, 7, '');
console.log(ans ? ans + '=7' : '');
