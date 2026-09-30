var input = require('fs')['readFileSync']('/dev/stdin', 'utf8');
var arr = input['trim']()['split']('\n');
var n = arr['shift']() - 0;
var [a, b] = [0, 1];
arr['forEach'](_0x29c001 => {
  var [type, value] = _0x29c001['split'](' ')['map'](Number);
  if (type == 1) {
    b *= value;
    a *= value;
  } else {
    if (type == 2) {
      a -= value;
    } else {
      if (type == 3) {
        a += value;
      }
    }
  }
});
console['log'](a + ' ' + b);
