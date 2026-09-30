function main(input) {
  var count = 0;
  for (var i = 0; i < input.length; i++) {
    if (input[i] == 'o') {
      count++;
    }
  }
  console.log(100 + count * 1000);
}

main(require('fs').readFileSync(0, 'utf8'));
