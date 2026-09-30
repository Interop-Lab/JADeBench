const fs = require("fs");

function main(input) {
  const firstLine = input.split("\n")[0];
  let decoded = "";

  for (let index = 0; index < firstLine.length; index += 2) {
    decoded += firstLine[index];
  }

  console.log(decoded);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
