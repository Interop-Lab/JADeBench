function Main(input) {
  const numbers = input.split(' ').map(part => parseInt(part));
  console.log(numbers[0] + numbers[1] >= numbers[2] ? 'Yes' : 'No');
}

Main(require('fs').readFileSync('stdin', 'utf8').trim());
