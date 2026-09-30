const fs = require("fs");

function main(input) {
  const numbers = input.split(" ").map((value) => parseInt(value));
  const sumOfFirstTwo = numbers[0] + numbers[1];

  console.log(sumOfFirstTwo >= numbers[2] ? "Yes" : "No");
}

const input = fs.readFileSync("/dev/stdin", "utf8").trim();
main(input);
