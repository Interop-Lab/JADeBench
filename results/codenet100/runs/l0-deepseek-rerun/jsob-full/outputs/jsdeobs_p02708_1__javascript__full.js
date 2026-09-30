const main = (input) => {
  const [a, b] = input.trim().split(/\s+/).map(Number);
  let sum = 0;
  for (let i = b; i <= a; i++) {
    const term1 = ((i - 1) * i) / 2;
    const term2 = (a - i) * a + i;
    const term3 = term2 - 1;
    sum += term3 * term1;
  }
  console.log(sum + 1);
};

process.env.MYTEST
  ? process.env.MYTEST === "test"
    ? test()
    : main(require("fs").readFileSync("/dev/stdin", "utf8"))
  : main(require("fs").readFileSync("/dev/stdin", "utf8"));
