'use strict';
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf8').split('\n');
const str = lines[0];
const n = str.length - 1;
const dfs = (i, expr, exprStr) => {
  if (i === n) {
    return eval(exprStr + str[n]) === 7 ? exprStr + str[n] : '';
  }
  const plusPath = dfs(i + 1, expr, exprStr + str[i] + '+');
  if (plusPath) return plusPath;
  return dfs(i + 1, expr, exprStr + str[i] + '-');
};
const ans = dfs(0, 0, '');
console.log(ans ? ans + '=7' : '');
