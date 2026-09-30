'use strict';
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var cin = input.split(/ |\n/);
var cid = 0;

function next(str) {
  return str ? cin[cid++] : +cin[cid++];
}

function nexts(n, str) {
  return str ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(x => +x);
}

function nextm(n, m, str) {
  var arr = [];
  if (str) {
    for (var i = 0; i < n; i++) arr.push(cin.slice(cid, cid += m));
  } else {
    for (var i = 0; i < n; i++) arr.push(cin.slice(cid, cid += m).map(x => +x));
  }
  return arr;
}

function xArray(n) {
  var args = arguments;
  var len = args.length;
  var res = 'new Array(' + --len + ')' + n + '>';
  while (--len) res = 'new Array(' + len + ')' + res + ')';
  return eval(res);
}

var myOut = main();
if (myOut !== undefined) console.log(myOut);

function main() {
  var a = nexts(4);
  var ans = a[0] * (a[1] * 2 + a[2] * 3 + a[3] * 4) / 10;
  switch (a[0] * 2 + a[1] * 3 + a[2] * 4) {
    case 0:
      ans += 1;
      break;
    case 1:
      if (a[0] + a[1] + a[2] + a[3]) ans += 2;
      break;
  }
  return ans;
}
