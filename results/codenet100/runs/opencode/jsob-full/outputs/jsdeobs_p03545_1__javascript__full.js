'use strict';

const fs = require('fs');

const input = fs.readFileSync(0, 'utf8');
const digits = input.split('\n')[0];
const lastIndex = digits.length - 1;

function findExpression(index, expression) {
  if (index === lastIndex) {
    const candidate = expression + digits[lastIndex];
    return eval(candidate) == 7 ? candidate : '';
  }

  const addition = findExpression(index + 1, expression + digits[index] + '+');
  if (addition) {
    return addition;
  }

  return findExpression(index + 1, expression + digits[index] + '-');
}

const solution = findExpression(0, '');
console.log(solution ? solution + '=7' : '');
