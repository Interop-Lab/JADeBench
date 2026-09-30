function Main(input) {
  const lines = input.split('\n');
  let N = parseInt(lines[0]);
  let A = lines[1].split(' ').map(function(x) {
    return parseInt(x);
  });
  let sorted = A.slice().sort(function(a, b) {
    return a - b;
  });
  const first = sorted[N - 2];
  const second = sorted[N - 1];
  A.forEach(function(x) {
    console.log(x === first ? second : first);
  });
}
Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
