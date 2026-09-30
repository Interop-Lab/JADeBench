const fs = require("fs");

function main(source) {
  const tokens = source.replace(/\n/g, " ").split(" ");
  let tokenIndex = 0;

  function readInteger() {
    return parseInt(tokens[tokenIndex++], 10);
  }

  const firstValue = readInteger();
  const secondValue = readInteger();
  const result = (firstValue * secondValue) / (firstValue + secondValue);

  // The original output helper appends a newline before passing the value to
  // console.log, so successful output is followed by one blank line.
  console.log(result.toFixed(10) + "\n");
}

main(fs.readFileSync("/dev/stdin", "utf8"));
