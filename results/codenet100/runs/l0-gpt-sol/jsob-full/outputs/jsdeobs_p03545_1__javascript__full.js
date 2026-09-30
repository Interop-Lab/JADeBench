'use strict';

const lines = require('fs').readFileSync(0, 'utf8').split('\n');
const str = lines[0];
const lastIndex = str.length - 1;

function dfs(index, expression) {
    if (index === lastIndex) {
        const result = expression + str[lastIndex];
        return eval(result) == 7 ? result : '';
    }

    const withPlus = dfs(index + 1, expression + str[index] + '+');
    if (withPlus) {
        return withPlus;
    }

    return dfs(index + 1, expression + str[index] + '-');
}

const answer = dfs(0, '');
console.log(answer ? answer + '=7' : '');
