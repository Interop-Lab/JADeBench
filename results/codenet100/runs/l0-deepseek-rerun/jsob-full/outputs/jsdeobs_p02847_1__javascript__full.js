function Main(input) {
  var result;
  switch (input) {
    case 'A':
      result = '7';
      break;
    case 'B':
      result = '6';
      break;
    case 'C':
      result = '5';
      break;
    case 'D':
      result = '4';
      break;
    case 'E':
      result = '3';
      break;
    case 'F':
      result = '2';
      break;
    case 'G':
      result = '1';
      break;
  }
  console.log(result);
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
