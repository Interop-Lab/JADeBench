const fs = require("fs");

function main(input) {
  const rows = input
    .trim()
    .split("\n")
    .map((line) => line.split(" "));

  const rowCount = parseInt(rows[0][0], 10);
  let result = -1;
  let weightedTotal = 0;

  for (let index = 0; index < rowCount; index += 1) {
    const [firstText, secondText] = rows[index + 1];
    const first = parseInt(firstText, 10);
    const second = parseInt(secondText, 10);

    result += second;
    weightedTotal += first * second;
  }

  result += Math.floor((weightedTotal - 1) / 9);
  console.log(result);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
