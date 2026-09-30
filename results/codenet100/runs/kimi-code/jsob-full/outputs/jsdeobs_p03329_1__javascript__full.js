const fs = require('fs');

function minimumTermCount(value) {
  if (value < 6) {
    return value;
  }

  if (value < 9) {
    return 1 + minimumTermCount(value - 6);
  }

  return Math.min(
    minimumTermCount(value - 6) + 1,
    minimumTermCount(value - 9) + 1,
  );
}

function main(input) {
  const value = parseInt(input, 10);
  console.log(minimumTermCount(value));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
