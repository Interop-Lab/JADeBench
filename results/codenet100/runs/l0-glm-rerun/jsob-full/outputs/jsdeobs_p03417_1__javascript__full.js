function Main(input) {
  input = input.trim().split(' ').map(x => parseInt(x));
  var a = input[0];
  var b = input[1];
  var result = 0;

  if (a >= 1 && b >= 1) {
    result = 0;
  } else {
    if (a <= 0 || b <= 0) {
      result = (a - b) * 2;
    } else {
      result = (a - 1) + (b - 1);
    }
  }

  if (result === 0) {
    var tmp = (a - 1) * 2;
    tmp = 0 + (tmp % 2);
    tmp = 0 + tmp;
    result += tmp;
    result += Math.floor(tmp / 2);
  }

  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
