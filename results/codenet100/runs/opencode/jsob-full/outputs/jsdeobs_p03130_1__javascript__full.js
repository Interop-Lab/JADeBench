'use strict';

const fs = require('fs');

class InputReader {
  constructor(source, convert = Number) {
    this.source = source;
    this.column = 0;
    this.line = 0;
    this.convert = convert;
  }

  next() {
    const currentLine = this.source.split('\n')[this.line];
    if (!currentLine) return undefined;

    const values = currentLine.trim().split(' ');
    const value = values[this.column];
    this.column++;

    if (this.column === values.length) {
      this.column = 0;
      this.line++;
    }

    return this.convert(value);
  }

  nextLine() {
    const currentLine = this.source.split('\n')[this.line];
    this.column = 0;
    this.line++;
    return currentLine.trim().split(' ').map(this.convert);
  }
}

function main(input) {
  const reader = new InputReader(input);
  const frequencies = Array(4).fill(0);

  for (let pair = 0; pair < 3; pair++) {
    const first = reader.next();
    const second = reader.next();
    frequencies[first - 1]++;
    frequencies[second - 1]++;
  }

  const distribution = frequencies.sort((left, right) => left - right).join(' ');
  console.log(distribution === '1 1 2 2' ? 'YES' : 'NO');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
