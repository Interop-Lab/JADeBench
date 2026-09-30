'use strict';

function Input(source, converter) {
  this.source = source;
  this.column = 0;
  this.line = 0;
  this.converter = converter || Number;
}

Input.prototype.next = function () {
  const line = this.source.split('\n')[this.line];
  if (!line) return;

  const values = line.trim().split(' ');
  const value = values[this.column++];

  if (this.column === values.length) {
    this.column = 0;
    this.line++;
  }

  return this.converter(value);
};

Input.prototype.nextLine = function () {
  const line = this.source.split('\n')[this.line];
  this.column = 0;
  this.line++;
  return line.split(' ').map(this.converter);
};

function main(source) {
  const input = new Input(source);
  const counts = Array(4).fill(0);

  for (let i = 0; i < 3; i++) {
    const first = input.next();
    const second = input.next();
    counts[first - 1]++;
    counts[second - 1]++;
  }

  const frequencies = counts.sort((a, b) => a - b).join(' ');
  console.log(frequencies === '1 1 2 2' ? 'YES' : 'NO');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
