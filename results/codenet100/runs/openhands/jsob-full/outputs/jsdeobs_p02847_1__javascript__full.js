const fs = require("fs");

function printDayNumber(day) {
  let dayNumber;

  switch (day) {
    case "SUN":
      dayNumber = "7";
      break;
    case "MON":
      dayNumber = "6";
      break;
    case "TUE":
      dayNumber = "5";
      break;
    case "WED":
      dayNumber = "4";
      break;
    case "THU":
      dayNumber = "3";
      break;
    case "FRI":
      dayNumber = "2";
      break;
    case "SAT":
      dayNumber = "1";
      break;
  }

  console.log(dayNumber);
}

printDayNumber(fs.readFileSync("/dev/stdin", "utf8"));
