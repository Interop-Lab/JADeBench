const fs = require("fs");

function main(input) {
  let oCount = 0;

  for (let index = 0; index < 3; index += 1) {
    if (input[index] == "o") {
      oCount += 1;
    }
  }

  console.log(700 + oCount * 100);
}

const input = fs.readFileSync("/dev/stdin", "utf8");
main(input);
