const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');

const ms = [];
const flag = [];

for (let i = 0; i < 100000; i++) {
  flag[i] = true;
}

let i = 1;
while (true) {
  const m = 3 * i - 1;
  const s = 6 * i + 1;
  if (m > 100000) break;
  i++;
  if (flag[m]) ms.push(m);
  if (flag[s]) ms.push(s);
  let j = 1;
  while (true) {
    if (m * j > 100000) break;
    flag[m * j] = false;
    flag[s * j] = false;
    j++;
  }
}

while (true) {
  const n = arr.length - 1;
  if (n == 0) break;
  const ans = [];
  let i = 0;
  ms.forEach(function (x) {
    if (n % x == 0) ans.push(x);
    return n == x;
  });
  console.log(n + ': ' + ans.join(' '));
}
