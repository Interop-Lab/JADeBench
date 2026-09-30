function Main(input) {
  var lines = input.split('\n');
  var n = parseInt(lines[0]);
  var result = 0;
  var seen = new Set();
  var current = n;

  for (var i = 0; i < Math.sqrt(n); i++) {
    var j = i;
    for (var k = 0; j < n; k++) {
      if (current % Math.pow(i, k) == 0) {
        result++;
        current = current / Math.pow(i, k);
      } else {
        break;
      }
      j = Math.pow(i, k + 1);
    }
  }

  if (result == 1 && n == 1) {
    result = 0;
  }

  console.log('%s', result);
  return result;
}

function debug(input) {
  var _0x4d024a = 'WA';
  var _0x3e5c4b = document.getElementById('debug' + input).value;
  var _0x251304 = Main(_0x3e5c4b);
  if (_0x251304 == document.getElementById('debug' + input).value.split('\n')[0]) {
    _0x4d024a = 'AC';
  }
  document.getElementById('debug' + input).style.color = _0x4d024a;
}

Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
