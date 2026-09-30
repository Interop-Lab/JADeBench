function Main(input) {
  const happiness =
    Math.floor(input / 500) * 1000 +
    Math.floor((input % 500) / 5) * 5;

  console.log(happiness);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
