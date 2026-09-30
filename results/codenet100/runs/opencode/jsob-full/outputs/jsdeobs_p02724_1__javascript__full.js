const fs = require("fs");

function calculateResult(input) {
  let result = 0;

  result += 1000 * Math.floor(input / 500);
  result += 5 * Math.floor((input % 500) / 5);

  console.log(result);
}

const input = fs.readFileSync("/dev/stdin", "utf8");
calculateResult(input);
