function main(input) {
  var count = 0;
  for (var i = 0; i < 3; i++) {
    if (input[i] == 'o') {
      count++;
    }
  }
  console.log(5 + count * 2);
}

main(require('fs').readFileSync(0, 'utf8'));
