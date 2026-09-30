const out = (value) => {
  console.log(value);
};
const outln = (value) => {
  console.log(value + '\n');
};
const inS = () => {
  return input[inputCnt++];
};
const inI = () => {
  return parseInt(inS(), 10);
};
const inF = () => {
  return parseFloat(inS());
};

function Main(inputValue) {
  init(inputValue);
  const a = inI();
  const b = inI();
  outln((a + b + (a * b)).toFixed(10));
}

var input, inputCnt;

function debug() {
  Main(document.getElementById('input').value);
}

function init(source) {
  input = source.replace(/\n/g, ' ');
  input = input.split(' ');
  inputCnt = 0;
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
