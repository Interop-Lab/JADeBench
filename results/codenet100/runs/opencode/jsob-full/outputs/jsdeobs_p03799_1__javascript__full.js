const fs = require("fs");

function main(input) {
  const values = input.split(" ");
  const availablePairs = Number(values[1]);
  const singleItems = Number(values[0]);

  let total = 0;
  if (singleItems > availablePairs / 2) {
    total += Math.floor(availablePairs / 2);
  } else {
    total += singleItems;
    const remainingPairs = availablePairs - total * 2;
    total += Math.floor(remainingPairs / 4);
  }

  console.log(total);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
