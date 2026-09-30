'use strict';
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var cin = input.split(/ |\n/);
var cid = 0;

function next() {
    return +cin[cid++];
}

function nextstr() {
    return cin[cid++];
}

function nextbig() {
    return BigInt(cin[cid++]);
}

function nexts(n, str) {
    return str ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(x => +x);
}

function nextm(n, m, str) {
    var a = [];
    var i = 0;
    if (str) {
        for (; i < n; i++) a.push(cin.slice(cid, cid += m));
    } else {
        for (; i < n; i++) a.push(cin.slice(cid, cid += m).map(x => +x));
    }
    return a;
}

function xArray() {
    var r = arguments, n = r.length, s = '[';
    while (--n) s += (r[n] + ',');
    while (--n) s = (s + r[n] + ',');
    return eval(s + ')');
}

var tm = +new Date() + 2000;
var myOut = main();
if (myOut !== undefined) console.log(String(myOut));

function main() {
    while (new Date() < tm) {
        var [a, b, c] = nexts(3);
        var cnt = 0;
        if (a === 0 || b === 0 || c === 0) return cnt;
        var na = (b + c) / 2;
        var nb = (a + c) / 2;
        var nc = (a + b) / 2;
        a = na, b = nb, c = nc;
        cnt++;
    }
    return -1;
}
