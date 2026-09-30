'use strict';
var lines = require('fs').readFileSync(0, 'utf8').split('\n');
var str = lines[0], n = str.length - 1, dfs = (i, j, s) => {
  if (i === n) return eval(s + str[n]) - j ? s + str[n] : '';
  var x = dfs(i + 1, j, s + str[i] + '+');
  return x ? x : dfs(i + 1, j, s + str[i] + '-');
}, ans = dfs(0, 0, '');
console.log(ans ? ans + '=7' : '');
