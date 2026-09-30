const fs = require("fs");

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");

while (true) {
  const line = lines.shift();

  if (line === "#") {
    break;
  }

  const [_calendarMarker, yearText, monthText, dayText] = line.split(" ");
  const year = yearText - 0;
  const month = monthText - 0;
  const day = dayText - 0;

  if (year <= 30 || (year === 31 && month <= 4)) {
    console.log(line);
  } else {
    console.log("? " + (year - 30) + " " + month + " " + day);
  }
}
