'use strict';

function Main(input) {
  const firstLine = input.split('\n')[0];
  const text = [];

  for (const character of firstLine) {
    if (character === 'B') {
      text.pop();
    } else {
      text.push(character);
    }
  }

  console.log(text.join(''));
}
