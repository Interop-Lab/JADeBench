const fs = require("fs");

function main(input) {
  const modulus = 10 ** 9 + 7;
  const [upperBound, start] = input.trim().split(" ").map(Number);
  let total = 0;

  for (let current = start; current <= upperBound + 1; current++) {
    const triangularBeforeCurrent = ((current - 1) * current) / 2;
    const remainingCount = upperBound - current + 1;
    const weightedRemaining = ((remainingCount + upperBound) * current) / 2;

    total += weightedRemaining - triangularBeforeCurrent + 1;
  }

  console.log(((total % modulus) + modulus) % modulus);
}

if (process.env.MYTEST) {
  if (process.env.MYTEST === "test") {
    test();
  } else {
    main(fs.readFile("/dev/stdin", "utf8"));
  }
} else {
  main(fs.readFileSync("/dev/stdin", "utf8"));
}
