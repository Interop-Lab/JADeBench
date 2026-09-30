'use strict';
function I(source, formatter) {
    this._s = source;
    this._c = 0;
    this._l = 0;
    this._f = formatter || Number;
}

I.prototype.a = function() {
    var line = this._s.split('\n')[this._l];
    if (!line) return;
    var parts = line.trim().split(' ');
    var token = parts[this._c];
    this._c++;
    if (parts.length === this._c) {
        this._c = 0;
        this._l++;
    } else {
        var nextLine = this._s.split('\n')[this._l];
        if (!nextLine) return;
        var nextParts = nextLine.trim().split(' ');
        if (nextParts.length === this._c) {
            this._c = 0;
            this._l++;
        }
    }
    return this._f(token);
};

I.prototype.l = function() {
    var line = this._s.split('\n')[this._l];
    this._c = 0;
    this._l++;
    return line.split(' ').map(this._f);
};

function main(input) {
    const parser = new I(input);
    const counts = Array(10).fill(0);
    for (let i = 0; i < 20; i++) {
        let a = parser.a();
        let b = parser.a();
        counts[a - 1]++;
        counts[b - 1]++;
    }
    if (counts.reduce((a, b) => a - b).toString() === '0') {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
