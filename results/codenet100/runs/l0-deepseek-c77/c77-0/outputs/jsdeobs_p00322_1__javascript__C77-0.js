const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const x = input.trim().split(' ').map(Number);
let cnt = 0;
for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    for (let c = 1; c <= 9; c++) {
      for (let d = 1; d <= 8; d++) {
        for (let e = 1; e <= 9; e++) {
          for (let f = 1; f <= 9; f++) {
            const z = (a + c + f + (b + e) * 10 + d * 100 + '').split('').map(Number);
            if (z.length !== 3) continue;
            z.push(...[a, b, c, d, e, f]);
            const flag = z.every((value, index) => {
              return (x[index] === value || x[index] === -1) && z.indexOf(index + 1) >= 0;
            });
            if (flag) cnt++;
          }
        }
      }
    }
  }
}
console.log(cnt);
