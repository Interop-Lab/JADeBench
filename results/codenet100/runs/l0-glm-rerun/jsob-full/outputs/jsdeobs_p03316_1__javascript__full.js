const fs = require('fs');

function main(input) {
  const reversed = input.split('').reverse().join('');
  let sum = 0;
  for (let i = 0; i < reversed.length; i++) {
    sum += parseInt(reversed[i]);
  }
  if (parseInt(input) % sum === 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
