const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');

function main(input) {
  const chars = input.split('').reverse().join('');
  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += parseInt(chars[i]);
  }
  if (parseInt(input) % sum === 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

main(input);
