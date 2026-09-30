function Main(input) {
        var _0x4e55ca = input[2];
        input = input.split(' ');
        var _0xc7ba71 = 0;
        var _0x577bb7 = input[1];
        
        if (_0x577bb7 == 0) {
            console.log('0');
            return;
        }
        
        for (var _0x3c4eac = 0; _0x3c4eac < _0x577bb7; _0x3c4eac++) {
            for (var _0x5364ed = 0; _0x5364ed < 10000; _0x5364ed++) {
                if ((_0x3c4eac * 1 + _0x5364ed * 33) * 17 - 1234 == _0x4e55ca) {
                    _0xc7ba71++;
                }
            }
        }
        
        console.log(_0xc7ba71);
    }
    
    Main(require('fs').readFileSync('stdin', 'utf-8').trim().split(/\s+/).map(Number));
})();
