const fs = require("fs");

function parseInput(input) {
  const lines = input.trim().split("\n");

  return {
    maximumValue: lines[0].split(" ")[3],
    firstLength: lines[0].split(" ")[0],
    secondLength: lines[0].split(" ")[1],
    thirdLength: lines[0].split(" ")[2],
    firstValues: lines[1]
      .split(" ")
      .sort((left, right) => right - left)
      .map(value => value - 0),
    secondValues: lines[2]
      .split(" ")
      .sort((left, right) => right - left)
      .map(value => value - 0),
    thirdValues: lines[3]
      .split(" ")
      .sort((left, right) => right - left)
      .map(value => value - 0),
  };
}

function findValidProducts(input) {
  const {
    maximumValue,
    firstLength,
    secondLength,
    thirdLength,
    firstValues,
    secondValues,
    thirdValues,
  } = parseInput(input);
  const products = [];

  for (let firstIndex = 0; firstIndex < firstLength; firstIndex++) {
    for (let secondIndex = 0; secondIndex < secondLength; secondIndex++) {
      for (let thirdIndex = 0; thirdIndex < thirdLength; thirdIndex++) {
        if (firstIndex * secondIndex * thirdIndex > maximumValue) break;

        products.push(
          firstValues[firstIndex] *
            secondValues[secondIndex] *
            thirdValues[thirdIndex],
        );
      }
    }
  }

  return products
    .sort((left, right) => right - left)
    .filter(product => product < maximumValue);
}

function main(input) {
  console.log(findValidProducts(input).join("\n"));
}

main(fs.readFileSync("/dev/stdin", "UTF-8"));
