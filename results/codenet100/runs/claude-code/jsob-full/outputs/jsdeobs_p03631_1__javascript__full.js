const fs = require('fs');

function main(input) {
  const text = String(input);
  console.log(text[2] == text[0] ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
