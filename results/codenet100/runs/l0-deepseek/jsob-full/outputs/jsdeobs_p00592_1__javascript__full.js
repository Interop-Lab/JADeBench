const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');
const arr = input.trim().split('\n');

while (true) {
  const npq = arr.shift();
  if (npq == '0') break;
  const parts = npq.split(' ');
  const n = Number(parts[0]);
  const p = time(parts[1]);
  const q = time(parts[2]);
  const tv = [];
  for (let i = p; i < q; i++) tv[i] = 0;
  for (let i = 0; i < n; i++) {
    const cm = Number(arr.shift());
    const ary = arr.shift().split(' ');
    for (let j = 0; j < cm; j++) {
      const start = time(ary[0]);
      const stop = time(ary[1]);
      for (let k = start; k < stop; k++) tv[k]++;
    }
  }
  let max = -1;
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

function time(str) {
  const parts = str.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
