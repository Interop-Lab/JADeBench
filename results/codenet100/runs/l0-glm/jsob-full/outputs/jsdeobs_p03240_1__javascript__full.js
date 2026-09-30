'use strict';
const main = input => {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  let a = [];
  let b = [];
  let c = [];
  lines.slice(1, n + 1).forEach(line => {
    let parts = line.split(' ').map(x => parseInt(x));
    a.push(parts[0]);
    b.push(parts[1]);
    c.push(parts[2]);
  });
  const m = 100;
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= m; j++) {
      let ans = -1;
      for (let k = 0; k < n; k++) {
        let dist = Math.abs(c[k] - Math.abs(b[k] - i)) + Math.abs(a[k] - j);
        if (ans === -1) {
          ans = dist;
        } else {
          if (ans !== dist) {
            ans = -2;
            break;
          }
        }
      }
      if (ans === -2) continue;
      console.log('Case #%d %d %d', j, i, ans);
    }
  }
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
