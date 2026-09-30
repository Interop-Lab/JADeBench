const fs = require("fs");

function main(input) {
  const numbers = input
    .split("\n")[0]
    .split(" ")
    .map((value) => parseInt(value, 10))
    .sort((left, right) => right - left);

  let [largest, middle, smallest] = numbers;
  let operations = 0;

  if ((middle - smallest) % 2 === 0) {
    operations += largest - middle;
    smallest += operations;
    operations += (largest - smallest) / 2;
  } else {
    largest++;
    middle++;
    operations++;

    operations += largest - middle;
    smallest += largest - middle;
    operations += (largest - smallest) / 2;
  }

  console.log(operations);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
