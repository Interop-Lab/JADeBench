const fs = require('fs');

function main(input) {
  const characters = input.toString().split('');
  let digitSum = 0;

  for (let index = 0; index < characters.length; index += 1) {
    digitSum += parseInt(characters[index]);
  }

  if (parseInt(input) % digitSum === 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
main(input);
