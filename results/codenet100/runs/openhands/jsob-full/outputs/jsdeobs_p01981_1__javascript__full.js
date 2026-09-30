const fs = require('fs');

const inputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

let lineIndex = 0;
while (true) {
  const inputLine = inputLines[lineIndex];
  lineIndex += 1;
  if (inputLine === '#') break;

  const [, yearText, monthText, dayText] = inputLine.split(' ');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const usesOriginalCalendar = year <= 30 || (year === 31 && month <= 4);
  if (usesOriginalCalendar) {
    console.log(inputLine);
    continue;
  }

  console.log(`? ${year - 30} ${month} ${day}`);
}
