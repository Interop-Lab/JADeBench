const fs = require('fs');

function Main(input) {
  const text = String(input);

  if (text[2] == text[0]) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
