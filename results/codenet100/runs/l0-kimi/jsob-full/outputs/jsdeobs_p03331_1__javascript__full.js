function main(input) {
    var _0x3e8700 = [];
    var _0x2eaca0 = parseInt(input, 10);
    var _0x33871f = _0x2eaca0.toString().length;
    var _0x1c8c6d = Math.pow(10, _0x33871f - 1);
    
    for (var _0x27f894 = 0; _0x27f894 < _0x33871f; _0x27f894++) {
        _0x3e8700.push(Math.floor(_0x2eaca0 / _0x1c8c6d));
        _0x2eaca0 = _0x2eaca0 % _0x1c8c6d;
        _0x1c8c6d /= 10;
    }
    
    var _0x23fc0b = _0x3e8700.reduce((_0x37786f, _0x4c18ba) => _0x37786f + _0x4c18ba);
    
    if (_0x23fc0b < 0) {
        _0x23fc0b = -_0x23fc0b;
    }
    
    console.log(_0x23fc0b);
}

main(require('fs').readFileSync('stdin', 'utf8'));
