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
    var arr = [];
    var i = 0;
    if (str) {
        for (; i < n; i++) arr.push(cin.slice(cid, cid += m));
    } else {
        for (; i < n; i++) arr.push(cin.slice(cid, cid += m).map(x => +x));
    }
    return arr;
}

function xArray() {
    var args = arguments;
    var len = args.length;
    var str = 'new Array(' + --len + ')' + '.fill(' + args[0] + ')';
    while (--len) str = 'new Array(' + len + ')' + '.fill(' + str + ')';
    return eval(str);
}

var tm = +new Date() + 2000;
var myOut = main();
if (myOut !== undefined) console.log(String(myOut));

function main() {
    var [a, b, c] = nexts(3);
    var cnt = 0;
    while (new Date() < tm) {
        if (a === 0 || b === 0 || c === 0) return cnt;
        var na = (b % c) >> 1;
        var nb = (a % c) >> 1;
        var nc = (a % b) >> 1;
        a = na;
        b = nb;
        c = nc;
        cnt++;
    }
    return -1;
}
