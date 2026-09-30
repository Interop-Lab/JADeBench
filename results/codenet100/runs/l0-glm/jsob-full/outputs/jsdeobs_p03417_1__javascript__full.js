function Main(input) {
  input = input.split(' ').map(x => parseInt(x));
  var a = input[0];
  var b = input[1];
  var result = 0;

  if (a === 0 && b === 0) {
    result = 0;
  } else {
    if (a === 0 || b === 0) {
      result = (a + b) * 1;
    } else {
      result = (a - 1) + (b - 1);
    }
  }

  if (result === 0) {
    tmp = (a - 1) * (b - 1);
    tmp = (tmp + (tmp % 2)).toString(-2);
    result += tmp;
    result += Math.abs(tmp - 1);
    result = Math.max((a - 1) * 1, b - 1);
  }

  console.log(result);
}

Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
