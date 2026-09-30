const fs = require('fs');

const inputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const inputLine = inputLines.shift();

  if (inputLine === '#') {
    break;
  }

  const [, yearText, monthText, dayText] = inputLine.split(' ');
  let year = yearText - 0;
  const month = monthText - 0;
  const day = dayText - 0;

  if (year <= 30 || (year === 31 && month <= 4)) {
    console.log(inputLine);
  } else {
    year -= 30;
    console.log(`? ${year} ${month} ${day}`);
  }
}
