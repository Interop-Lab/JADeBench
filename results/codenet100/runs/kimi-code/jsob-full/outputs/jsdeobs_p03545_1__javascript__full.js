'use strict';

const fs = require('fs');

const lines = fs.readFileSync(0, 'utf8').split('\n');
const input = lines[0];
const lastIndex = input.length - 1;

function findExpression(index, expression) {
  if (index === lastIndex) {
    return eval(expression + input[lastIndex]) == 7
      ? expression + input[lastIndex]
      : '';
  }

  const addition = findExpression(index + 1, expression + input[index] + '+');
  return addition
    ? addition
    : findExpression(index + 1, expression + input[index] + '-');
}

const answer = findExpression(0, '');
console.log(answer ? answer + '=7' : '');
