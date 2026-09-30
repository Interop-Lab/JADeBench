const fs = require("fs");

/**
 * Return the six faces of a die after rolling it one square.
 *
 * The face order is intentionally kept in the same order as the input. Each
 * permutation below is the original program's exact representation of a roll.
 */
function rollDie(direction, faces) {
  const [face0, face1, face2, face3, face4, face5] = faces;

  switch (direction) {
    case "N":
      return [face1, face5, face2, face3, face0, face4];
    case "S":
      return [face4, face0, face2, face3, face5, face1];
    case "E":
      return [face3, face1, face0, face5, face4, face2];
    case "W":
      return [face2, face1, face5, face0, face4, face3];
    default:
      return [];
  }
}

const input = fs.readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split("\n");
let currentDie = lines[0].split(" ").map(Number);
const targetDie = lines[1].split(" ").map(Number);
const directions = "NSEW".split("");

let matchesTarget;
for (let attempt = 0; attempt < 100; attempt++) {
  const direction = directions[Math.floor(Math.random() * 4)];
  currentDie = rollDie(direction, currentDie);
  matchesTarget = currentDie.every(
    (face, index) => face == targetDie[index],
  );

  if (matchesTarget) {
    break;
  }
}

console.log(matchesTarget ? "Yes" : "No");
