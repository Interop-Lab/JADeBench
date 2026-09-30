const fs = require("fs");

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");
const [itemCount, threshold] = lines.shift().split(" ").map(Number);
const values = lines.shift().split(" ").map(Number);

let excessTotal = 0;
values.forEach((value) => {
  excessTotal += Math.max(0, value - threshold);
});

console.log(excessTotal == 0 ? "kusoge" : excessTotal);
