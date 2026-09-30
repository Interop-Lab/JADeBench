function equal(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length != keysB.length) return false;
  for (var i = 0; i < keysA.length; i++)
    if (a[keysA[i]] !== b[keysA[i]]) return false;
  return true;
}

function pi(x) {
  return parseInt(x, 10);
}

var six = [2, 3, 5, 7, 11, 13].map(x => Math.pow(2, x));
var nine = [1, 4, 6, 8, 9].map(x => Math.pow(3, x));

function count(n) {
  if (n < 6) return n;
  if (n < 9) return 1 + (n - 6);
  return Math.max(
    1 + count(n - six.filter(x => x <= n).length),
    1 + count(n - nine.filter(x => x <= n).length)
  );
}

function main(input) {
  var n = pi(input);
  console.log(count(n));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
