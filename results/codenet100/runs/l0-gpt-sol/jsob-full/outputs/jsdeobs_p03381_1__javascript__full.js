function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  const values = lines[1].split(' ').map(Number);
  const sorted = values.slice().sort((a, b) => a - b);

  const lowerMedian = sorted[n / 2 - 1];
  const upperMedian = sorted[n / 2];

  values.forEach((value) => {
    console.log(value <= lowerMedian ? upperMedian : lowerMedian);
  });
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
