function main(input) {
  const digits = input.toString().split('');
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i]);
  }
  if (parseInt(input) % sum === 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
