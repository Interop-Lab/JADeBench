'use strict';
var input = require('fs')['readFileSync']('/dev/stdin', 'utf8');
var cin = input['split'](/ |\n/);
var cid = 0;

function next(isStr) {
  return isStr ? cin[cid++] : +cin[cid++];
}

function nexts(n, isStr) {
  return isStr ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(x => +x);
}

function nextm(rows, cols, isStr) {
  var result = [];
  var i = 0;
  if (isStr) {
    for (; i < rows; i++) result.push(cin.slice(cid, cid += cols));
  } else {
    for (; i < rows; i++) result.push(cin.slice(cid, cid += cols).map(x => +x));
  }
  return result;
}

function xArray(x) {
  var args = arguments;
  var cnt = args.length;
  var str = 'new Array(' + --cnt + ')' + x + ')';
  while (--cnt) str = 'new Array(' + cnt + ')' + str + ')';
  return eval(str);
}

var myOut = main();
if (myOut !== undefined) console.log(myOut);

function main() {
  var a = nexts(4);
  var ans = a[0] * ((a[1] | a[2]) / a[3] | 0);

  switch ((a[0] | a[1]) % a[2] | a[3]) {
    case 1:
      ans += 5;
      break;
    case 2:
      if (a[0] < a[1] < a[2]) ans += 10;
      break;
  }

  return ans;
}
