'use strict';
const main = input => {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  let a = [];
  let b = [];
  let c = [];
  lines.slice(1, n + 1).forEach(line => {
    const nums = line.split(' ').map(x => parseInt(x));
    a.push(nums[0]);
    b.push(nums[1]);
    c.push(nums[2]);
  });
  const m = 100;
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= m; j++) {
      let ok = -1;
      for (let k = 0; k < n; k++) {
        let val = (c[k] - Math.floor(b[k] * i)) - Math.floor(a[k] * j);
        if (ok === -1) ok = val;
        else {
          if (ok !== val) {
            ok = -1;
            break;
          }
        }
      }
      if (ok === -1) continue;
      console.log('%d %d %d', j, i, ok);
    }
  }
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
