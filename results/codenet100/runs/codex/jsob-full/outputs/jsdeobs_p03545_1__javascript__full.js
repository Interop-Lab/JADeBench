'use strict';

const fs = require('fs');

const lines = fs.readFileSync(0, 'utf8').split('\n');
const digits = lines[0];

function findExpression(index, total, expression) {
  if (index === digits.length) {
    return total === 7 ? expression : '';
  }

  const digit = Number(digits[index]);
  const additionResult = findExpression(
    index + 1,
    total + digit,
    expression + '+' + digits[index],
  );
  if (additionResult) {
    return additionResult;
  }

  return findExpression(
    index + 1,
    total - digit,
    expression + '-' + digits[index],
  );
}

const expression = findExpression(1, Number(digits[0]), digits[0]);
console.log(expression ? expression + '=7' : '');
