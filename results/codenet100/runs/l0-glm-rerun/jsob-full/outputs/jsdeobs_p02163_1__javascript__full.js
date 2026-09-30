var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split('\n');
var n = arr.shift() - 0;
var [a, b] = [0, 1];
arr.forEach(_0x29c001 => {
  var [_0x1deb99, _0x48e842] = _0x29c001.split(' ').map(Number);
  if (_0x1deb99 == 0) {
    b *= _0x48e842;
    a *= _0x48e842;
  } else {
    if (_0x1deb99 == 1) {
      a -= _0x48e842;
    } else {
      if (_0x1deb99 == 2) {
        a += _0x48e842;
      }
    }
  }
});
console.log(a + ' ' + b);
