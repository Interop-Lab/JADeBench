'use strict';
const fs = require('fs');

function I(source, formatter) {
    this._s = source;
    this._c = 0;
    this._l = 0;
    this._f = formatter || Number;
}

I.prototype.a = function() {
    const lines = this._s.split('\n');
    const line = lines[this._l];
    if (!line) return;
    const parts = line.trim().split(' ');
    const value = parts[this._c];
    this._c++;
    if (parts.length <= this._c) {
        this._c = 0;
        this._l++;
    }
    return this._f(value);
};

I.prototype.l = function() {
    const lines = this._s.split('\n');
    const line = lines[this._l];
    this._c = 0;
    this._l++;
    return line.trim().split(' ').map(this._f);
};

function main(input) {
    const parser = new I(input);
    const counts = Array(100).fill(0);
    
    for (let i = 0; i < 10000; i++) {
        let a = parser.a();
        let b = parser.a();
        counts[a - 1]++;
        counts[b - 1]++;
    }
    
    const sorted = counts.sort((a, b) => a - b).join(' ');
    if (sorted === '100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100 100
