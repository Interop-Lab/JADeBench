function Main(input) {
  input = input.trim().split('\n').map(function(line) {
    return line.split(' ');
  });
  let N = parseInt(input[0][0], 10);
  let sum = 0;
  let sumY = 0;
  for (let i = 0; i < N; i++) {
    sum += parseInt(input[i + 1][0], 10);
    sumY += parseInt(input[i + 1][1], 10) * parseInt(input[i + 1][2], 10);
  }
  sum += Math.floor(sumY / 100);
  console.log(sum);
}
Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
