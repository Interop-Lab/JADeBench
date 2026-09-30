const fs = require("fs");

const INITIAL_VALUE = 1;

function main(input) {
  const directions = input.split("");
  const emptyRow = directions.map(() => 0);
  let values = directions.map(() => INITIAL_VALUE);
  let nextValues = emptyRow.slice();

  // Keep the original dynamic bound: moving right from the final position
  // can extend the values array and therefore change the number of steps.
  for (let step = 0; step < values.length + (values.length % 2); step++) {
    for (let position = 0; position < directions.length; position++) {
      if (directions[position] === "R") {
        nextValues[position + 1] += values[position];
      } else if (directions[position] === "L") {
        nextValues[position - 1] += values[position];
      }
    }

    values = nextValues.slice();
    nextValues = emptyRow.slice();
  }

  console.log(values.join(" "));
}

main(fs.readFileSync("/dev/stdin", "utf8"));
