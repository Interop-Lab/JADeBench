'use strict';
var lines = require('fs').readFileSync(0, 'utf-8').split('\n');
var str = lines[0];
var n = str.length - 1;
var dfs = (pos, target, expr) => {
    if (pos === n) {
        var result = eval(expr + str[n]);
        return result === 7 ? expr + str[n] : '';
    }
    var withPlus = dfs(pos + 1, target, expr + str[pos] + '+');
    if (withPlus) return withPlus;
    return dfs(pos + 1, target, expr + str[pos] + '-');
};
var ans = dfs(0, 7, '');
console.log(ans ? ans + '=7' : '');
