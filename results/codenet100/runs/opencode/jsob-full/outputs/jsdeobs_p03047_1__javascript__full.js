const fs = require("fs");

function main(input) {
  const [firstValue, secondValue] = input.trim().split(" ");
  const result = firstValue - secondValue + 1;
  console.log(result);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
