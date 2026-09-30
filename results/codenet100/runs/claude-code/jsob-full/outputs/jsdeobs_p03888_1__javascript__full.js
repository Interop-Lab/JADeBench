function main(inputText) {
  const tokens = inputText.replace(/\n/g, " ").split(" ");
  let tokenIndex = 0;

  const readInteger = () => parseInt(tokens[tokenIndex++], 10);
  const firstNumber = readInteger();
  const secondNumber = readInteger();
  const result = (firstNumber * secondNumber) / (firstNumber + secondNumber);

  console.log(result.toFixed(10) + "\n");
}

const fs = require("fs");
main(fs.readFileSync("/dev/stdin", "utf8"));
