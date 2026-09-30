const fs = require("fs");

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");
const valueCount = Number(lines.shift());
const values = lines.shift().split(" ").map(Number);
const queryCount = Number(lines.shift());
const answers = [];

for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const [start, end, target] = lines[queryIndex].split(" ").map(Number);
  let matches = 0;

  for (let valueIndex = start; valueIndex < end; valueIndex++) {
    if (values[valueIndex] === target) {
      matches++;
    }
  }

  answers.push(matches);
}

console.log(answers.join("\n"));
