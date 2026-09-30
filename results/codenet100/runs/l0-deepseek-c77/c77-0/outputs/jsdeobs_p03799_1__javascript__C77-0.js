function Main(input) {
  const parts = input.split(' ');
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  let result = 0;
  if (a > b / 2) {
    result += Math.floor(b / 2);
  } else {
    result += a;
    b -= result * 2;
    result += Math.floor(b / 4);
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
