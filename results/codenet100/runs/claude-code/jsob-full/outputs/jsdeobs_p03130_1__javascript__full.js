'use strict';

const fs = require('fs');

class TokenReader {
  constructor(source, convert = Number) {
    this.source = source;
    this.column = 0;
    this.line = 0;
    this.convert = convert;
  }

  next() {
    const line = this.source.split('\n')[this.line];
    if (!line) return undefined;

    const tokens = line.trim().split(' ');
    const token = tokens[this.column];
    this.column += 1;

    if (this.column === tokens.length) {
      this.column = 0;
      this.line += 1;
    }

    return this.convert(token);
  }

  nextLine() {
    const line = this.source.split('\n')[this.line];
    this.column = 0;
    this.line += 1;
    return line.split(' ').map(this.convert);
  }
}

function main(input) {
  const reader = new TokenReader(input);
  const frequencies = Array(4).fill(0);

  for (let pair = 0; pair < 3; pair += 1) {
    const firstValue = reader.next();
    const secondValue = reader.next();
    frequencies[firstValue - 1] += 1;
    frequencies[secondValue - 1] += 1;
  }

  const frequencyPattern = frequencies
    .sort((left, right) => left - right)
    .join(' ');

  console.log(frequencyPattern === '1 1 2 2' ? 'YES' : 'NO');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
