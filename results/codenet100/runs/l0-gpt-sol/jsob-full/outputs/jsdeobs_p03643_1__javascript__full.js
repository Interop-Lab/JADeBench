function Main(input) {
  console.log("Hello World " + input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
