'use strict';

function I(source, converter) {
  this._s = source;
  this._c = 0;
  this._l = 0;
  this._f = converter || Number;
}

I.prototype.a = function () {
  var line = this._s.split('\n')[this._l];
  if (!line) return;
  var parts = line.trim().split(' ');
  var value = parts[this._c];
  this._c++;
  if (parts.length === this._c) {
    this._c = 0;
    this._l++;
  }
  return this._f(value);
};

I.prototype.l = function () {
  var line = this._s.split('\n')[this._l];
  this._c = 0;
  this._l++;
  return line.split(' ').map(this._f);
};

function main(input) {
  const parser = new I(input);
  const counts = Array(3).fill(0);
  for (let i = 0; i < 3; i++) {
    let a = parser.a();
    let b = parser.a();
    counts[a - 1]++;
    counts[b - 1]++;
  }
  if (counts.sort((a, b) => a - b).join(' ') === '1 2 3') {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

main(require('fs').readFileSync('stdin', 'utf8'));
