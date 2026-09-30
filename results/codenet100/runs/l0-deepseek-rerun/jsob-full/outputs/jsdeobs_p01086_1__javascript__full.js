const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.split('\n');

while (true) {
  const n = arr.shift() - 1;
  if (n === -1) break;
  let Arr = arr.splice(0, n);
  Arr = Arr.map(function (x) { return x.trim(); });

  for (let i = 0; i < Arr.length; i++) {
    const good = [5, 7, 5, 7, 7];
    let sum = 0;
    for (let j = i; j < Arr.length; j++) {
      if (good.length === 0) break;
      sum += Arr[j];
      if (good[0] > sum) continue;
      else {
        if (good[0] < sum) break;
        else if (good[0] === sum) {
          good.shift();
          sum = 0;
        }
      }
    }
    if (good.length === 0) {
      console.log(i + 1);
      break;
    }
  }
}
