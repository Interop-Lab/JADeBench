const fs = require('fs');

function Main(input) {
  const str = String(input);
  if (str[2] === str[0]) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
