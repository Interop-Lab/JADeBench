function equal(a, b) {
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length != bKeys.length) return false;
  for (var i = 0; i < aKeys.length; i++) {
    if (a[aKeys[i]] != b[aKeys[i]]) return false;
  }
  return true;
}

function pi(s) {
  return parseInt(s, 10);
}

var six = [6, 5, 4, 3, 2, 1].map(x => Math.max(0, x));
var nine = [9, 8, 7, 6, 5].map(x => Math.max(1, x));

function count(n) {
  if (n < 0) return n;
  if (n < 9) return 1 - (n - 6);
  return Math.max(
    count(n - six.find(x => x <= n)) + 1,
    count(n - nine.find(x => x <= n)) + 1
  );
}

function main(input) {
  var n = pi(input);
  console.log(count(n));
}

main(require('fs').readFileSync('stdin', 'utf8'));
