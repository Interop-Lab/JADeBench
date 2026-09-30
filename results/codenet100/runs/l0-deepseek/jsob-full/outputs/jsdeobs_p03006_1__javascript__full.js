const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.split('\n');
const n = +lines[0];
if (n < 2) {
  console.log(0);
  return;
}
const nums = lines.slice(1).map(line => line.split(' ').map(Number));
const pairMap = {};
nums.forEach(a => {
  nums.forEach(b => {
    if (a === b) return;
    const key = [a[0] + b[0], a[1] + b[1]].join('_');
    pairMap[key] = pairMap[key] == null ? 1 : pairMap[key] + 1;
  });
});
const best = Object.keys(pairMap).reduce((best, key) => {
  const count = pairMap[key];
  return count > best[0] ? [count, key] : [best[0], best[1]];
}, [-1, '']);
console.log(n - best[0] / 2);
