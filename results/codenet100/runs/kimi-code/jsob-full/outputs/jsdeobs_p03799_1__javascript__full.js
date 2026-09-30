const fs = require("fs");

function main(input) {
  const values = input.split(" ");
  let total = Number(values[0]);
  const available = Number(values[1]);
  let result = 0;

  if (available > total / 2) {
    result += Math.floor(total / 2);
  } else {
    result += available;
    total -= result * 2;
    result += Math.floor(total / 4);
  }

  console.log(result);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
