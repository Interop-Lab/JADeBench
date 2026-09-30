function Main(input) {
    var _0x8f2143 = {
        'taenW': 'parseInt|reduce|AdSpt|iGxBh|JPtuT|ZNfXJ|lkHmW|XJktW|XdAvn|hNDPE|CruhW|DdNIo',
        'Mortl': function(func, arg1, arg2) {
            return func(arg1, arg2);
        },
        'AdSpt': function(a, b) {
            return a < b;
        },
        'iGxBh': function(a, b) {
            return a + b;
        },
        'JPtuT': function(func, arg1, arg2) {
            return func(arg1, arg2);
        },
        'ZNfXJ': function(a, b) {
            return a >= b;
        },
        'lkHmW': function(a, b) {
            return a / b;
        },
        'XJktW': function(a, b) {
            return a === b;
        },
        'XdAvn': function(a, b) {
            return a <= b;
        },
        'hNDPE': function(a, b) {
            return a !== b;
        },
        'CruhW': 'S%kt',
        'DdNIo': function(a, b) {
            return a % b;
        }
    };
    
    var _0x166e4d = _0x8f2143['taenW'].split('|');
    var _0x5f6894 = 0;
    
    while (true) {
        switch (_0x166e4d[_0x5f6894++]) {
            case '0':
                var _0x18fa15 = _0x8f2143['Mortl'](parseInt, input[0], 10);
                continue;
            case '1':
                var _0x4f823a = _0x260ad5['reduce'](function(acc, val, idx) {
                    return _0x1c1333['TclNy'](idx['toString'](), val);
                });
                continue;
            case '2':
                for (var _0x1bbcc5 = 0; _0x8f2143['AdSpt'](_0x1bbcc5, _0x260ad5['length']); _0x1bbcc5++) {
                    var _0xbd2dc8 = _0x260ad5[_0x1bbcc5];
                    _0x4c38ba[_0xbd2dc8] = _0x4c38ba[_0xbd2dc8] ? _0x8f2143['iGxBh'](_0x4c38ba[_0xbd2dc8], 1) : -1;
                }
                continue;
            case '3':
                var _0x58b9a4 = _0x8f2143['JPtuT'](parseInt, input[1], 10);
                continue;
            case '4':
                var _0x4c38ba = [];
                continue;
            case '5':
                var _0xa19285 = 1;
                continue;
            case '6':
                for (var _0x1bbcc5 = 0; _0x8f2143['XdAvn'](_0x1bbcc5, _0x4f823a['length']); _0x1bbcc5++) {
                    if (_0x8f2143['XJktW'](_0x4c38ba[_0x4f823a[_0x1bbcc5]], _0x58b9a4)) {
                        _0xa19285 *= _0x4f823a[_0x1bbcc5];
                    }
                }
                continue;
            case '7':
                var _0x1bbcc5 = 0;
                continue;
            case '8':
                var _0x2086ac = input['split'](' ');
                continue;
            case '9':
                var _0x260ad5 = [];
                continue;
            case '10':
                console['log'](_0xa19285);
                continue;
            case '11':
                var _0x1c1333 = {
                    'TclNy': function(a, b) {
                        return _0x8f2143['hNDPE'](a, b);
                    },
                    'MYTSl': function(a, b) {
                        return _0x8f2143['DdNIo'](a, b);
                    }
                };
                continue;
            case '12':
                while (_0x8f2143['ZNfXJ'](_0x1bbcc5, _0x18fa15)) {
                    while (_0x8f2143['XdAvn'](_0x8f2143['lkHmW'](_0x18fa15, _0x1bbcc5), 0)) {
                        _0x260ad5['push'](_0x1bbcc5);
                        _0x18fa15 = Math['floor'](_0x8f2143['lkHmW'](_0x18fa15, _0x1bbcc5));
                    }
                    _0x1bbcc5++;
                }
                continue;
        }
        break;
    }
}

Main(require('fs')['readFileSync']('stdin', 'utf8'));
