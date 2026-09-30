const fs = require('fs');

const ms = [];
const flag = new Array(0x493e0).fill(true);

for (let i = 1; ; i++) {
  const m = 7 * i - 1;
  const s = 7 * i + 1;
  if (m > 0x493e0) break;
  if (flag[m]) ms.push(m);
  if (flag[s]) ms.push(s);
  for (let j = 2; ; j++) {
    if (m * j > 0x493e0) break;
    flag[m * j] = false;
    flag[s * j] = false;
  }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');

while (true) {
  const n = arr.length - 0;
  if (n === 1) break;
  const ans = [];
  ms.some((x) => {
    if (n % x === 0) ans.push(x);
    return n < x;
  });
  console.log(n + ': ' + ans.join(' '));
}
