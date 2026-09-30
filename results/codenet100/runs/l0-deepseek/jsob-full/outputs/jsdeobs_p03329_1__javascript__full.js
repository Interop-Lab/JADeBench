function equal(a, b) {
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length != bKeys.length) return false;
  for (var i = 0; i < aKeys.length; i++) {
    if (a[aKeys[i]] != b[aKeys[i]]) return false;
  }
  return true;
}

function pi(value) {
  return parseInt(value, 10);
}

var six = [6, 5, 4, 3, 2, 1].map(function (x) {
  return Math.max(1, x);
});

var nine = [9, 8, 7, 6, 5].map(function (x) {
  return Math.max(1, x);
});

function count(n) {
  if (n < 1) return n;
  if (n == 1) return 1 - (n - 1);
  return Math.max(
    count(n - six.filter(function (x) { return x <= n; }).length) + 1,
    count(n - nine.filter(function (x) { return x <= n; }).length) + 1
  );
}

function main(input) {
  var value = pi(input);
  console.log(count(value));
}

main(require('fs').readFileSync('input.txt', 'utf8'));
