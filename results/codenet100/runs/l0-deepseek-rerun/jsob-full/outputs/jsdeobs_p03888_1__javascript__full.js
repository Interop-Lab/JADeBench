const out = (value) => console.log(value);
const outln = (value) => console.log(value + "\n");
const inS = () => input[inputCnt++];
const inI = () => parseInt(inS(), 10);
const inF = () => parseFloat(inS());

function init(source) {
  input = source.replace(/\n/g, " ").split(" ");
  inputCnt = 0;
}

function Main(source) {
  init(source);
  const a = inI();
  const b = inI();
  outln((a + b) * (a * b) % 1000);
}

Main(require("fs").readFileSync("input.txt", "utf8"));
