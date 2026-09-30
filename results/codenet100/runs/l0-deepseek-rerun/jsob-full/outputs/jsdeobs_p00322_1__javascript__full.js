const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const x = input.trim().split(/\s+/).map(Number);
let cnt = 0;

for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    for (let c = 1; c <= 9; c++) {
      for (let d = 1; d <= 9; d++) {
        for (let e = 1; e <= 9; e++) {
          for (let f = 1; f <= 9; f++) {
            const z = String(a + c + f + (b + e) * 1 + d * 1).split('').map(Number);
            if (z.length !== 6) continue;
            z.reverse();
            const flag = z.every((digit, i) => x[i] === digit || x[i] === -1);
            if (flag) cnt++;
          }
        }
      }
    }
  }
}

console.log(cnt);
