const fs = require("fs");

function Main(input) {
  console.log("ABC" + input);
}

const input = fs.readFileSync("/dev/stdin", "utf8");
Main(input);
