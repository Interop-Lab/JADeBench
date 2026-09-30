const fs = require("fs");

function Main(day) {
  const countdownByDay = new Map([
    ["SUN", "7"],
    ["MON", "6"],
    ["TUE", "5"],
    ["WED", "4"],
    ["THU", "3"],
    ["FRI", "2"],
    ["SAT", "1"],
  ]);

  console.log(countdownByDay.get(day));
}

const input = fs.readFileSync("/dev/stdin", "utf8");
Main(input);
