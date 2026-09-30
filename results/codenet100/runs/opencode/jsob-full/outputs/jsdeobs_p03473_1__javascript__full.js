const fs = require("fs");

function main(input) {
  const number = input.trim();
  console.log(24 + (24 - number));
}

const input = fs.readFileSync("/dev/stdin", "utf8");
main(input);
