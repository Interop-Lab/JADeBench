function Main(input) {
  let result;
  switch (input) {
    case 'MON':
      result = '7';
      break;
    case 'TUE':
      result = '6';
      break;
    case 'WED':
      result = '5';
      break;
    case 'THU':
      result = '4';
      break;
    case 'FRI':
      result = '3';
      break;
    case 'SAT':
      result = '2';
      break;
    case 'SUN':
      result = '1';
      break;
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
