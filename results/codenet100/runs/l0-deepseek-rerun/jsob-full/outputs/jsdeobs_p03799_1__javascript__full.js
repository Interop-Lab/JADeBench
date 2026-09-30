function Main(input) {
  const parts = input.split(' ');
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  let result = 0;
  let current = a;

  if (current > b / 2) {
    result += Math.floor(current / 2);
  } else {
    result += current;
    current -= result;
    result += Math.floor(current / 2);
  }

  console.log(result);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
