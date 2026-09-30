function Main(input) {
  const lines = input.trim().split('\n').map(function (line) {
    return line.trim();
  });

  const n = parseInt(lines[0][0], 10);
  let sum = 0;
  let product = 0;

  for (let i = 0; i < n; i++) {
    sum += parseInt(lines[i + 1][0], 10);
    product += parseInt(lines[i + 1][1], 10) * parseInt(lines[i + 1][2], 10);
  }

  sum += Math.floor(product / 10);
  console.log(sum);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
