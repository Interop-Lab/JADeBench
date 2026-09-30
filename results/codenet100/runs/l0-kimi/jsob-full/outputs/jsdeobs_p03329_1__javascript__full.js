function _0x5192(_0x5588f2, _0x52aad2) {
    _0x5588f2 = _0x5588f2 - 0;
    var _0x590260 = _0x1f53();
    var _0x5c22ea = _0x590260[_0x5588f2];
    if (_0x5192['vzXlqL'] === undefined) {
        var _0x567fe6 = function(_0x3094f7) {
            var _0x2f43ac = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
            var _0x5cd2e7 = '',
                _0xaa6259 = '';
            for (var _0x379cae = 0, _0x1dc94c, _0x24a42e, _0x21f43e = 0; _0x24a42e = _0x3094f7['charAt'](_0x21f43e++); ~_0x24a42e && (_0x1dc94c = _0x379cae % 4 ? _0x1dc94c * 64 + _0x24a42e : _0x24a42e, _0x379cae++ % 4) ? _0x5cd2e7 += String['fromCharCode'](255 & _0x1dc94c >> (-2 * _0x379cae & 6)) : 0) {
                _0x24a42e = _0x2f43ac['indexOf'](_0x24a42e);
            }
            for (var _0x162ff5 = 0, _0x4ca9a4 = _0x5cd2e7['length']; _0x162ff5 < _0x4ca9a4; _0x162ff5++) {
                _0xaa6259 += '%' + ('00' + _0x5cd2e7['charCodeAt'](_0x162ff5)['toString'](16))['slice'](-2);
            }
            return decodeURIComponent(_0xaa6259);
        };
        var _0x9c573e = function(_0x387286, _0x398725) {
            var _0xb720fa = [],
                _0x2b0d15 = 0,
                _0x534930, _0x24e6ee = '';
            _0x387286 = _0x567fe6(_0x387286);
            var _0x3bdba7;
            for (_0x3bdba7 = 0; _0x3bdba7 < 256; _0x3bdba7++) {
                _0xb720fa[_0x3bdba7] = _0x3bdba7;
            }
            for (_0x3bdba7 = 0; _0x3bdba7 < 256; _0x3bdba7++) {
                _0x2b0d15 = (_0x2b0d15 + _0xb720fa[_0x3bdba7] + _0x398725['charCodeAt'](_0x3bdba7 % _0x398725['length'])) % 256, _0x534930 = _0xb720fa[_0x3bdba7], _0xb720fa[_0x3bdba7] = _0xb720fa[_0x2b0d15], _0xb720fa[_0x2b0d15] = _0x534930;
            }
            _0x3bdba7 = 0, _0x2b0d15 = 0;
            for (var _0x93d37a = 0; _0x93d37a < _0x387286['length']; _0x93d37a++) {
                _0x3bdba7 = (_0x3bdba7 + 1) % 256, _0x2b0d15 = (_0x2b0d15 + _0xb720fa[_0x3bdba7]) % 256, _0x534930 = _0xb720fa[_0x3bdba7], _0xb720fa[_0x3bdba7] = _0xb720fa[_0x2b0d15], _0xb720fa[_0x2b0d15] = _0x534930, _0x24e6ee += String['fromCharCode'](_0x387286['charCodeAt'](_0x93d37a) ^ _0xb720fa[(_0xb720fa[_0x3bdba7] + _0xb720fa[_0x2b0d15]) % 256]);
            }
            return _0x24e6ee;
        };
        _0x5192['xKEUaZ'] = _0x9c573e, _0x5192['LoYlrp'] = {}, _0x5192['vzXlqL'] = true;
    }
    var _0x2f3d74 = _0x590260[0], _0x5efbc7 = _0x5588f2 + _0x2f3d74, _0x36a060 = _0x5192['LoYlrp'][_0x5efbc7];
    return !_0x36a060 ? (_0x5192['sWSYvz'] === undefined && (_0x5192['sWSYvz'] = true), _0x5c22ea = _0x5192['xKEUaZ'](_0x5c22ea, _0x52aad2), _0x5192['LoYlrp'][_0x5efbc7] = _0x5c22ea) : _0x5c22ea = _0x36a060, _0x5c22ea;
}

function _0x5885fd(_0x912ea3, _0x52a9d0) {
    return _0x5192(_0x52a9d0 - 215, _0x912ea3);
}

function equal(a, b) {
    if (typeof a !== typeof b) return false;
    if (a === b) return true;
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (var i = 0; i < keysA.length; i++) {
        if (a[keysA[i]] !== b[keysB[i]]) return false;
    }
    return true;
}

function pi(n) {
    return parseInt(n, 10);
}

var six = [6, 16, 26, 36, 46, 56].map(x => Math.pow(10, x));
var nine = [9, 19, 29, 39, 49].map(x => Math.pow(10, x));

function count(n) {
    if (n < 0) return n;
    if (n < 10) return 9 - n;
    return Math.max(count(n - six.filter(x => x <= n).length), count(n - nine.filter(x => x <= n).length));
}

function main(input) {
    var n = pi(input);
    console.log(count(n));
}

main(require('fs').readFileSync('stdin', 'utf8'));
