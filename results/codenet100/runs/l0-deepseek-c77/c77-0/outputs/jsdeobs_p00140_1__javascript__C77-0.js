const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.replace(/\n$/, '').split('\n');
const n = Arr.length - 0;
for (let i = 0; i < n; i++) {
  const arr = Arr[i].split(' ').map(Number);
  const s = arr[0];
  const g = arr[1];
  const ans = [s];
  let plus = 1;
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
  } else if (s > g && s >= 6 && g >= 6) {
    do {
      s++;
      if (s == 10) {
        s = 5;
      }
      ans.push(s);
    } while (s != g);
  } else if (s > g && s >= 6 && g <= 5) {
    do {
      s += plus;
      if (s == 10) {
        s = 5;
        plus = -1;
      }
      ans.push(s);
    } while (s != g);
  }
  console.log(ans.join(' '));
}
