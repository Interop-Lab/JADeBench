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
    const line = this.source.split('\n')[this.line];
    if (!line) return undefined;

    const values = line.trim().split(' ');
    const value = values[this.column];
    this.column++;

    if (this.column === values.length) {
      this.column = 0;
      this.line++;
    }

    return this.convert(value);
  }

  nextLine() {
    const line = this.source.split('\n')[this.line];
    this.column = 0;
    this.line++;
    return line.trim().split(' ').map(this.convert);
  }
}

function main(input) {
  const reader = new InputReader(input);
  const endpointCounts = Array(4).fill(0);

  for (let pair = 0; pair < 3; pair++) {
    const firstEndpoint = reader.next();
    const secondEndpoint = reader.next();
    endpointCounts[firstEndpoint - 1]++;
    endpointCounts[secondEndpoint - 1]++;
  }

  const degreeSignature = endpointCounts.sort((left, right) => left - right).join(' ');
  console.log(degreeSignature === '1 1 2 2' ? 'YES' : 'NO');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
