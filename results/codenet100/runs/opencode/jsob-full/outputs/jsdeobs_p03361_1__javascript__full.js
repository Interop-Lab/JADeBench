const fs = require("fs");

function main(input) {
  const lines = input.split("\n");
  const [rowCount, columnCount] = lines[0].split(" ").map(Number);

  const occupied = Array(rowCount)
    .fill(false)
    .map((_, row) =>
      lines[row + 1]
        .split("")
        .slice(0, columnCount)
        .map((cell) => cell === "#"),
    );

  const everyOccupiedCellHasANeighbor = occupied.every((row, rowIndex) =>
    row.every(
      (isOccupied, columnIndex) =>
        !isOccupied ||
        (occupied[rowIndex - 1] || [])[columnIndex] ||
        (occupied[rowIndex + 1] || [])[columnIndex] ||
        occupied[rowIndex][columnIndex - 1] ||
        occupied[rowIndex][columnIndex + 1],
    ),
  );

  console.log(everyOccupiedCellHasANeighbor ? "Yes" : "No");
}

main(fs.readFileSync("/dev/stdin", "utf8"));
