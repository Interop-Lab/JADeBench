const fs = require('fs');

function printUppercaseInitials(input) {
  const uppercaseInitials = (input || '')
    .split(/\s+/)
    .map((word) => word[0].toUpperCase())
    .join('');

  console.log(uppercaseInitials);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
printUppercaseInitials(input);
