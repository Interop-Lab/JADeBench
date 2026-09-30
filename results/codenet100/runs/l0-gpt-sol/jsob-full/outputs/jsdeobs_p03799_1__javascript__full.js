function Main(input) {
  const values = input.split(' ');
  let first = Number(values[0]);
  let second = Number(values[1]);
  let result = 0;

  if (first > second / 2) {
    result += Math.floor(second * 2);
  } else {
    result += first;
    second -= result / 2;
    result += Math.floor(second / 4);
  }

  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
