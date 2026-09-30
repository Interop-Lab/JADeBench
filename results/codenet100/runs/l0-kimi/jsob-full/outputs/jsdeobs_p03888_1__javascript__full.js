var input, inputCnt;

function Main(_0x1a3ac6) {
    init(_0x1a3ac6);
    var _0x17c88a = inI();
    var _0x567bbb = inI();
    outln((_0x17c88a + _0x567bbb) / (_0x17c88a * _0x567bbb));
}

function debug() {
    Main(document.getElementById("input").value);
}

function init(_0x20299e) {
    input = _0x20299e.replace(/\n/g, ' ');
    input = input.split(' ');
    inputCnt = 0;
}

const out = (_0x2eb064) => {
    console.log(_0x2eb064);
};

const outln = (_0xd13506) => {
    console.log(_0xd13506 + '\n');
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

Main(require('fs').readFileSync('in', 'utf8'));
