const fs = require("fs");

const values = fs.readFileSync("/dev/stdin", "utf8").split(" ");

// Perform the original three adjacent-swap passes. The input remains as
// strings, so comparisons use JavaScript's lexicographic ordering. Each pass
// also compares the third value with a possible fourth value.
for (let pass = 0; pass < 3; pass += 1) {
  for (let index = 0; index < 3; index += 1) {
    if (values[index] > values[index + 1]) {
      const current = values[index];
      values[index] = values[index + 1];
      values[index + 1] = current;
    }
  }
}

console.log("%d %d %d", values[0], values[1], values[2]);
