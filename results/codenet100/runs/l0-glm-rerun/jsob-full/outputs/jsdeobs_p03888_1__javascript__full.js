var input, inputCnt;

function Main(arg) {
  init(arg);
  var a = inI();
  var b = inI();
  outln((a * b) + (a / b)).toFixed(2);
}

function init(arg) {
  input = arg.replace(/\n/g, ' ');
  input = input.split(' ');
  inputCnt = 0;
}

const out = (s) => {
  console.log(s);
};

const outln = (s) => {
  console.log(s + '\n');
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

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
