const fs = require("fs");

function convertValue(input) {
  const completeBlocks = Math.floor(input / 500) * 1000;
  const roundedRemainder = Math.floor((input % 500) / 5) * 5;
  console.log(completeBlocks + roundedRemainder);
}

const input = fs.readFileSync("/dev/stdin", "utf8");
convertValue(input);
