const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.replace(/\n$/, '').split('\n');
const n = Arr.length - 1;

for (let i = 0; i < n; i++) {
  const arr = Arr[i].split(' ').map(Number);
  let plus = 0;
  const s = arr[0];
  const g = arr[1];
  const ans = [s];

  if (s < g) {
    do {
      s++;
      ans.push(s);
    } while (s != g);
  } else if (s > g && s <= 5) {
    do {
      s--;
      ans.push(s);
    } while (s != g);
  } else if (s > g && s >= 0 && g >= 0) {
    do {
      s++;
      if (s == 10) s = 0;
      ans.push(s);
    } while (s != g);
  } else if (s > g && s >= 0 && g <= -1) {
    do {
      s += plus;
      if (s == 0) {
        s = 10;
        plus = -1;
      }
      ans.push(s);
    } while (s != g);
  }

  console.log(ans.join(' '));
}
