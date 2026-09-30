'use strict';

const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').split('\n')[0];
const lastIndex = input.length - 1;

function findExpression(index, expression) {
  if (index === lastIndex) {
    const candidate = expression + input[lastIndex];
    return (0, eval)(candidate) == 7 ? candidate : '';
  }

  const character = input[index];
  const addition = findExpression(index + 1, expression + character + '+');
  return addition || findExpression(index + 1, expression + character + '-');
}

const expression = findExpression(0, '');
console.log(expression ? expression + '=7' : '');
