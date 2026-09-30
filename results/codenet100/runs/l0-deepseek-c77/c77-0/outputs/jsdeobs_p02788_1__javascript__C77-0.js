function main(inputLines) {
  const firstLineParts = inputLines[0].split(' ');
  const n = Number(firstLineParts[0]);
  const k = Number(firstLineParts[1]);
  const c = Number(firstLineParts[2]);

  const intervals = [];
  for (let i = 1; i <= n; i++) {
    const parts = inputLines[i].split(' ');
    intervals.push([Number(parts[0]), Number(parts[1])]);
  }

  intervals.sort((a, b) => a[0] - b[0]);

  let totalCost = 0;
  for (let i = 0; i < n; i++) {
    const interval = intervals[i];
    if (interval[1] > 0) {
      const groups = Math.ceil(interval[1] / c);
      totalCost += groups;
      for (let j = i; j < n; j++) {
        const other = intervals[j];
        if (other[0] <= interval[0] + 2 * k + 1) {
          other[1] -= c * groups;
        } else {
          break;
        }
      }
    }
  }

  console.log(totalCost);
}

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
main(input);
