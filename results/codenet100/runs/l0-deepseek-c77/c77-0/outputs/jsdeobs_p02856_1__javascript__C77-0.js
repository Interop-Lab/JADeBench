function Main(input) {
  const lines = input.trim().split('\n').map(function (line) {
    return line.split(' ');
  });
  const n = parseInt(lines[0][0], 10);
  let total = -1;
  let sumProducts = 0;
  for (let i = 0; i < n; i++) {
    total += parseInt(lines[i + 1][1], 10);
    sumProducts += parseInt(lines[i + 1][0], 10) * parseInt(lines[i + 1][1], 10);
  }
  total += Math.floor((sumProducts + 1) / 9);
  console.log(total);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
