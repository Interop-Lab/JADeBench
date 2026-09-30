function Main(input) {
  input = input.trim().split('\n').map(function (line) {
    return line.split(' ');
  });
  let n = parseInt(input[0][0], 10);
  let sum = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    sum += parseInt(input[i + 1][0], 10);
    total += parseInt(input[i + 1][1], 10) * parseInt(input[i + 1][2], 10);
  }
  sum += Math.floor(total / 2);
  console.log(sum);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
