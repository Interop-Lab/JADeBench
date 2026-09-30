const fs = require('fs');

var input, inputCnt;

function init(data) {
  input = data.replace(/\n/g, ' ');
  input = input.trim();
  inputCnt = 0;
}

const out = (msg) => {
  console.log(msg);
};

const outln = (msg) => {
  console.log(msg + '\n');
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

function Main(data) {
  init(data);
  var a = inI();
  var b = inI();
  outln(((a + b) + ' ' + (a * b)).toString());
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
