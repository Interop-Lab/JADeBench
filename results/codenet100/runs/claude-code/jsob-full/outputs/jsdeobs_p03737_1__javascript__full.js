const fs = require('fs');

function printUppercaseInitials(input) {
  const initials = (input || '')
    .split(/\s+/)
    .map((word) => word[0].toUpperCase())
    .join('');

  console.log(initials);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
printUppercaseInitials(input);
