function Main(input) {
  const values = input.split(' ');
  const first = Number(values[0]);
  const second = Number(values[1]);

  let result = 0;
  if (first > second / 2) {
    result += Math.floor(second / 2);
  } else {
    result += first;
    const remainder = second - result * 2;
    result += Math.floor(remainder / 4);
  }

  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
