'use strict';

const fs = require('fs');

class InputReader {
  constructor(source, convert) {
    this.source = source;
    this.columnIndex = 0;
    this.lineIndex = 0;
    this.convert = convert || Number;
  }

  next() {
    const line = this.source.split('\n')[this.lineIndex];
    if (!line) return undefined;

    const values = line.trim().split(' ');
    const value = values[this.columnIndex];
    this.columnIndex++;

    if (this.columnIndex === values.length) {
      this.columnIndex = 0;
      this.lineIndex++;
    }

    return this.convert(value);
  }

  nextLine() {
    const line = this.source.split('\n')[this.lineIndex];
    this.columnIndex = 0;
    this.lineIndex++;
    return line.split(' ').map(this.convert);
  }
}

function main(input) {
  const reader = new InputReader(input);
  const occurrenceCounts = Array(4).fill(0);

  for (let pairIndex = 0; pairIndex < 3; pairIndex++) {
    const firstValue = reader.next();
    const secondValue = reader.next();
    occurrenceCounts[firstValue - 1]++;
    occurrenceCounts[secondValue - 1]++;
  }

  const sortedCounts = occurrenceCounts.sort((left, right) => left - right);
  const hasRequiredDistribution = sortedCounts.join(' ') === '1 1 2 2';
  console.log(hasRequiredDistribution ? 'YES' : 'NO');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
