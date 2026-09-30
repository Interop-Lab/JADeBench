function main(input) {
  var chars = input.toString().split('');
  var sum = 0;
  for (var i = 0; i < chars.length; i++) {
    sum += parseInt(chars[i]);
  }
  if ((parseInt(input) % sum) === 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

main(require('fs').readFileSync('stdin', 'utf8'));
