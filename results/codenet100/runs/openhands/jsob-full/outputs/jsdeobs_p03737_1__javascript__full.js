const fs = require('fs');

function printInitials(input) {
  const initials = (input || '')
    .split(/\s+/)
    .map((word) => word[0].toUpperCase())
    .join('');

  console.log(initials);
}

printInitials(fs.readFileSync('/dev/stdin', 'utf8'));
