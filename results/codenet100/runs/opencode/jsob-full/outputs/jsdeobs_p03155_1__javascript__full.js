const fs = require("fs");

function main(input) {
  const numbers = input.split("\n").map(Number);
  const firstPlusOne = numbers[0] + 1;
  console.log((firstPlusOne - numbers[1]) * (firstPlusOne - numbers[2]));
}

main(fs.readFileSync("/dev/stdin", "utf8").trim());
