const fs = require('fs');

function time(str) {
  const parts = str.split('').map(Number);
  return parts[0] * 10 * 60 * 60 + parts[1] * 60 * 60 + parts[2] * 10 * 60 + parts[3] * 60;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');

while (true) {
  const npq = arr.shift();
  if (npq == '0 0 0') break;

  const parts = npq.split(' ');
  const n = parts[0] - 0;
  const p = time(parts[1]);
  const q = time(parts[2]);

  const tv = [];
  for (let i = p; i < q; i++) tv[i] = 0;

  for (let i = 0; i < n; i++) {
    const cm = arr.shift();
    const ary = arr.shift().split(' ');
    for (let j = 0; j < cm; j++) {
      const start = time(ary.shift());
      const stop = time(ary.shift());
      for (let k = start; k < stop; k++) tv[k]++;
    }
  }

  let max = 0;
  let cnt = 0;
  for (let i = p; i < q; i++) {
    if (tv[i] != n) {
      cnt++;
    } else {
      max = Math.max(max, cnt);
      cnt = 0;
    }
  }
  max = Math.max(max, cnt);
  console.log(max);
}
