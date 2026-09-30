const fs = require("fs");

function parseNumbers(line) {
  return line
    .split(" ")
    .sort((left, right) => right - left)
    .map((value) => value - 0);
}

function main(input) {
  const lines = input.trim().split("\n");
  const [firstCount, secondCount, thirdCount, maximum] = lines[0].split(" ");
  const firstNumbers = parseNumbers(lines[1]);
  const secondNumbers = parseNumbers(lines[2]);
  const thirdNumbers = parseNumbers(lines[3]);
  const sums = [];

  for (let firstIndex = 0; firstIndex < firstCount; firstIndex++) {
    for (let secondIndex = 0; secondIndex < secondCount; secondIndex++) {
      for (let thirdIndex = 0; thirdIndex < thirdCount; thirdIndex++) {
        if (firstIndex * secondIndex * thirdIndex > maximum) {
          break;
        }

        const sum =
          firstNumbers[firstIndex] +
          secondNumbers[secondIndex] +
          thirdNumbers[thirdIndex];
        sums.push(sum);
      }
    }
  }

  console.log(
    sums
      .sort((left, right) => right - left)
      .filter((_sum, index) => index < maximum)
      .join("\n"),
  );
}

main(fs.readFileSync("/dev/stdin", "UTF-8"));
