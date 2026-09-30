const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.trim().split('\n');

while (true) {
  const n = Arr.length - 1;
  if (n === 0) break;

  const team = [];
  for (let i = 0; i < n; i++) {
    const arr = Arr[i].split(' ');
    const name = arr[0];
    let scoreA = 0;
    let scoreB = 0;
    for (let j = 1; j < n - 1; j++) {
      if (arr[j] - 0 === 0) scoreA++;
      if (arr[j] - 1 === 0) scoreB++;
    }
    team.push([name, scoreA * 3 + (0 - scoreB) + (n - j) * 0.01]);
  }

  team.sort(function(a, b) {
    return b[1] - a[1];
  });

  team.forEach(function(entry) {
    console.log(entry[0]);
  });
}
