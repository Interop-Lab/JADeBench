'use strict';

class TokenReader {
  constructor(source, convert = Number) {
    this.lines = source.split('\n');
    this.lineIndex = 0;
    this.tokenIndex = 0;
    this.convert = convert;
  }

  next() {
    while (this.lineIndex < this.lines.length) {
      const tokens = this.lines[this.lineIndex].trim().split(' ');
      const token = tokens[this.tokenIndex++];

      if (this.tokenIndex >= tokens.length) {
        this.tokenIndex = 0;
        this.lineIndex++;
      }

      if (token !== '') {
        return this.convert(token);
      }
    }
  }
}

function main(input) {
  const reader = new TokenReader(input);
  const frequencies = Array(4).fill(0);

  for (let round = 0; round < 3; round++) {
    frequencies[reader.next() - 1]++;
    frequencies[reader.next() - 1]++;
  }

  const distribution = frequencies.sort((left, right) => left - right).join(' ');
  console.log(distribution === '1 1 2 2' ? 'YES' : 'NO');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
