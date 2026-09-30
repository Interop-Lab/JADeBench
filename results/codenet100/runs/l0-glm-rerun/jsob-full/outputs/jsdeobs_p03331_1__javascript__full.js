function main(input) {
    input = parseInt(input, 10);
    var length = input.toString().length;
    var divisor = Math.pow(10, length - 1);
    var digits = [];
    for (var i = 0; i < length; i++) {
      digits.push(Math.floor(input / divisor));
      input = input % divisor;
      divisor /= 10;
    }
    var sum = digits.reduce((a, b) => a + b);
    if (sum == 0) {
      sum = -1;
    }
    console.log(sum);
  }

  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
})();
