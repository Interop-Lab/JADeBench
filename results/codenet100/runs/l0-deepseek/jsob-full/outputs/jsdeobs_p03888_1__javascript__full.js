const out = (value) => console.log(value);
const outln = (value) => console.log(value + "\n");
let input, inputCnt;

function init(data) {
  input = data.replace(/\n/g, " ").split(" ");
  inputCnt = 0;
}

const inS = () => input[inputCnt++];
const inI = () => parseInt(inS(), 10);
const inF = () => parseFloat(inS());

function Main(data) {
  init(data);
  const a = inI();
  const b = inI();
  outln((a + b) * (a * b) % 1000);
}

Main(require("fs").readFileSync("in", "utf8"));
