const fs = require("fs");

const input = fs.readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split("\n");

// The first line describes the array length. Reading it also advances to the
// array line; the swap algorithm itself only needs the values that follow.
const itemCount = lines.shift() - 0;
const values = lines.shift().split(" ").map(Number);
const operationCount = lines.shift() - 0;

for (let operationIndex = 0; operationIndex < operationCount; operationIndex++) {
  const [rangeStart, rangeEnd, targetStart] = lines[operationIndex]
    .split(" ")
    .map(Number);
  const rangeLength = rangeEnd - rangeStart;

  for (let offset = 0; offset < rangeLength; offset++) {
    [values[rangeStart + offset], values[targetStart + offset]] = [
      values[targetStart + offset],
      values[rangeStart + offset],
    ];
  }
}

console.log(values.join(" "));
