function main(input) {
  const chars = input.toString().split('');
  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += parseInt(chars[i]);
  }
  if ((parseInt(input) % sum) === 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

main(require('fs').readFileSync('stdin', 'utf8'));
