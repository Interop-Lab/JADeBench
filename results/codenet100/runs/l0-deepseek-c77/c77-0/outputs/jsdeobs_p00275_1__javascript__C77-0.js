const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.trim().split('\n');

while (true) {
  const N = Arr.shift() - 0;
  if (N == 0) break;

  const n = [];
  let p = 0;
  for (let i = 0; i < N; i++) n[i] = 0;

  const str = Arr.shift();
  for (let i = 0; i < str.length; i++) {
    const v = str[i];
    const j = i % N;
    if (v == 'M') n[j]++;
    else if (v == 'S') {
      p += n[j] + 1;
      n[j] = 0;
    } else if (v == 'L') {
      n[j] += p + 1;
      p = 0;
    }
  }

  n.sort(function(a, b) { return a - b; });
  console.log(n.join(' ') + ' ' + p);
}
