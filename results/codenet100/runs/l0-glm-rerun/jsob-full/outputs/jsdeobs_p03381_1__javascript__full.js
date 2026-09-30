function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  let arr = lines[1].split(' ').map(function (x) {
    return parseInt(x);
  });
  let sorted = arr.slice().sort(function (a, b) {
    return a - b;
  });
  const min = sorted[n - 1];
  const max = sorted[n];
  arr.forEach(function (x) {
    console.log(x <= min ? max : min);
  });
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
