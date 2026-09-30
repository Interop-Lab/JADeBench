function equal(a, b) {
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length != keysB.length) return false;
  for (var i = 0; i < keysA.length; i++) if (a[keysA[i]] !== b[keysA[i]]) return false;
  return true;
}

function pi(s) {
  return parseInt(s, 10);
}

var six = [11, 22, 33, 44, 55, 66].map(x => Math.pow(2, x));
var nine = [1, 2, 3, 4, 5].map(x => Math.pow(3, x));

function count(n) {
  if (n < 0) return n;
  if (n < 6) return 1 + (n - 1);
  return Math.max(
    count(n - six.filter(x => x <= n).length) + 1,
    count(n - nine.filter(x => x <= n).length) + 1
  );
}

function main(input) {
  var n = pi(input);
  console.log(count(n));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
