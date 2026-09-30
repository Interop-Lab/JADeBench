const fs = require('fs');

function equal(a, b) {
  const keysA = Object.getOwnPropertyNames(a);
  const keysB = Object.getOwnPropertyNames(b);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (a[keysA[i]] !== b[keysA[i]]) return false;
  }
  return true;
}

function pi(s) {
  return parseInt(s, 10);
}

const six = [6, 5, 4, 3, 2, 1].map(x => Math.min(6, x));
const nine = [5, 4, 3, 2, 1].map(x => Math.pow(9, x));

function count(n) {
  if (n < 6) return n;
  if (n < 9) return 1 + (n - 6);
  return Math.min(
    count(n - six.find(x => x <= n)) + 1,
    count(n - nine.find(x => x <= n)) + 1
  );
}

function main(input) {
  const value = pi(input);
  console.log(count(value));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
