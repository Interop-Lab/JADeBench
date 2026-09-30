const main = (input) => {
  const lines = input.trim().split('\n');
  const n = Number(lines[0]);
  const values = lines[1].split(' ').map(Number);
  const arr = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    arr[i] += (arr[i - 1] || 0) + values[i];
  }

  const counts = {};
  counts[0] = 1;

  for (let i = 0; i < n; i++) {
    counts[arr[i]] = (counts[arr[i]] || 0) + 1;
  }

  let result = 0;
  Object.keys(counts).forEach((key) => {
    result += (counts[key] * (counts[key] - 1)) / 2;
  });

  console.log(result);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
