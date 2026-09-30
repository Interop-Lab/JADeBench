const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();

function Main(input) {
  const map = {
    'seven': '7',
    'six': '6',
    'five': '5',
    'four': '4',
    'three': '3',
    'two': '2',
    'one': '1'
  };
  console.log(map[input]);
}

Main(input);
