function Main(input) {
  input = input.split(' ').map(x => parseInt(x));
  console.log(input[0] + input[1] === input[2] ? 'Yes' : 'No');
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
