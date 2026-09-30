'use strict';
var lines = require('fs').readFileSync(0, 'utf8').split('\n');
var str = lines[0];
var n = str.length - 1;
var dfs = (i, j, s) => {
  if (i === n) return eval(s + str[n]) ? s + str[n] : '';
  var res = dfs(i + 1, j, s + str[i] + '+');
  return res ? res : dfs(i + 1, j, s + str[i] + '-');
};
var ans = dfs(0, 0, '');
console.log(ans ? ans + '=7' : '');
