let input;
let inputCnt;

function init(source) {
    input = source.replace(/\n/g, " ").split(" ");
    inputCnt = 0;
}

const out = value => {
    console.log(value);
};

const outln = value => {
    console.log(value + "\n");
};

const inS = () => input[inputCnt++];

const inI = () => parseInt(inS(), 10);

const inF = () => parseFloat(inS());

function Main(source) {
    init(source);

    const first = inI();
    const second = inI();
    const result = first / second + first * second;

    outln(result.toFixed(10));
}

function debug() {
    Main(document.getElementById("input").value);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
