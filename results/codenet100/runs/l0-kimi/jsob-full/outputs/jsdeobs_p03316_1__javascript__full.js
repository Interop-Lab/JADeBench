function main(input) {
    var _0x41c358 = input.toString().split('');
    var _0x1e8704 = 0;
    for (var _0x4f8ea5 = 0; _0x4f8ea5 < _0x41c358.length; _0x4f8ea5++) {
        _0x1e8704 += parseInt(_0x41c358[_0x4f8ea5]);
    }
    if (parseInt(input) % _0x1e8704 === 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}
main(require('fs').readFileSync('stdin', 'utf8'));
