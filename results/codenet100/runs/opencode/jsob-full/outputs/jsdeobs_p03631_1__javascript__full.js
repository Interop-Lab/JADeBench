function main(input) {
  const text = String(input);

  if (text[2] == text[0]) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

const input = require('fs').readFileSync('/dev/stdin', 'utf8');
main(input);
