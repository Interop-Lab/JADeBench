const fs = require("fs");

const clues = fs.readFileSync("/dev/stdin", "utf8").trim().split(" ").map(Number);
let solutionCount = 0;

for (let first = 1; first <= 9; first++) {
  for (let second = 1; second <= 9; second++) {
    for (let third = 1; third <= 9; third++) {
      for (let fourth = 1; fourth <= 8; fourth++) {
        for (let fifth = 1; fifth <= 9; fifth++) {
          for (let sixth = 1; sixth <= 9; sixth++) {
            const resultDigits = String(
              first + third + sixth + (second + fifth) * 10 + fourth * 100,
            )
              .split("")
              .map(Number);

            if (resultDigits.length !== 3) continue;

            const digits = [
              first,
              second,
              third,
              fourth,
              fifth,
              sixth,
              ...resultDigits,
            ];

            const matchesClues = digits.every((digit, index) => {
              const clueMatches = clues[index] == digit || clues[index] == -1;
              const containsRequiredDigit = digits.indexOf(index + 1) >= 0;
              return clueMatches && containsRequiredDigit;
            });

            if (matchesClues) solutionCount++;
          }
        }
      }
    }
  }
}

console.log(solutionCount);
