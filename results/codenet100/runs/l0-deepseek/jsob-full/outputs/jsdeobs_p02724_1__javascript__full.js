function Main(input) {
  let result = 0;
  result += Math.floor(input / 100) * 2;
  result += Math.floor((input % 100) / 10) * 3;
  console.log(result);
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
