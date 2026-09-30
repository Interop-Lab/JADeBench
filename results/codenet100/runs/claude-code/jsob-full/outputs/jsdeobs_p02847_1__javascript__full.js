const fs = require('fs');

function printReverseWeekdayNumber(day) {
  let reverseWeekdayNumber;

  switch (day) {
    case 'SUN':
      reverseWeekdayNumber = '7';
      break;
    case 'MON':
      reverseWeekdayNumber = '6';
      break;
    case 'TUE':
      reverseWeekdayNumber = '5';
      break;
    case 'WED':
      reverseWeekdayNumber = '4';
      break;
    case 'THU':
      reverseWeekdayNumber = '3';
      break;
    case 'FRI':
      reverseWeekdayNumber = '2';
      break;
    case 'SAT':
      reverseWeekdayNumber = '1';
      break;
  }

  console.log(reverseWeekdayNumber);
}

const day = fs.readFileSync('/dev/stdin', 'utf8');
printReverseWeekdayNumber(day);
