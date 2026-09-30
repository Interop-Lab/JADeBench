const fs = require('fs');

const inputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const line = inputLines.shift();
  if (line === '#') break;

  const [, yearText, monthText, dayText] = line.split(' ');
  let year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const usesOriginalCalendar = year <= 30 || (year === 31 && month <= 4);
  if (usesOriginalCalendar) {
    console.log(line);
  } else {
    year -= 30;
    console.log(`? ${year} ${month} ${day}`);
  }
}
