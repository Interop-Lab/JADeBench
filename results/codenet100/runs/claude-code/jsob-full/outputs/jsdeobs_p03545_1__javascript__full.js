'use strict';

const fs = require('fs');

const [digits] = fs.readFileSync(0, 'utf8').split('\n');
const lastIndex = digits.length - 1;

function findExpression(index, expression) {
  if (index === lastIndex) {
    const completeExpression = expression + digits[lastIndex];
    return eval(completeExpression) == 7 ? completeExpression : '';
  }

  const withPlus = findExpression(index + 1, expression + digits[index] + '+');
  if (withPlus) {
    return withPlus;
  }

  return findExpression(index + 1, expression + digits[index] + '-');
}

const expression = findExpression(0, '');
console.log(expression ? expression + '=7' : '');
