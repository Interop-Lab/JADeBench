function Main(input) {
  input = input.trim();
  console.log(24 + (24 - input));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
