const fs = require("fs");

function main(input) {
  const [first, second] = input.split(" ").map(value => parseInt(value));
  let result;

  if (first === 1 && second === 1) {
    result = 1;
  } else if (first === 1 || second === 1) {
    result = first + second - 3;
  } else {
    result = (first - 2) * (second - 2);
  }

  // Recompute large products in base 10,000 to avoid losing integer precision.
  if (result > 9_000_000_000_000_000) {
    const lowProduct = ((first - 2) % 10_000) * (second - 2);
    const highProduct =
      Math.floor((first - 2) / 10_000) * (second - 2) +
      Math.floor(lowProduct / 10_000);
    const lowDigits = ("0000" + (lowProduct % 10_000)).slice(-4);
    result = highProduct + lowDigits;
  }

  console.log(result);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
