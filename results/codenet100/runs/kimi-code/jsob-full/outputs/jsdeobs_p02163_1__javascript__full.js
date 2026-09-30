const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const [, ...commands] = input.split('\n');

let offset = 0;
let scale = 1;

commands.forEach((line) => {
  const [command, value] = line.split(' ').map(Number);

  if (command === 1) {
    offset *= value;
    scale *= value;
  } else if (command === 2) {
    offset -= value;
  } else if (command === 3) {
    offset += value;
  }
});

console.log(`${offset} ${scale}`);
