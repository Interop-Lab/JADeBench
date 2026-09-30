function Main(input) {
  input = input.split('\n');
  var N = parseInt(input[0]);
  var count = 0;
  var seen = new Set();
  var current = N;
  for (var i = 1; i < Math.sqrt(N); i++) {
    var j = i;
    for (var k = 0; j < N; k++) {
      if (current % Math.pow(i, k) == 0) {
        count++;
        current = current / Math.pow(i, k);
      } else {
        break;
      }
      j = Math.pow(i, k + 1);
    }
  }
  if (count == 1 && N == 1) {
    count = 0;
  }
  console.log('%s', count);
  return count;
}

function debug(input) {
  var _0x4d024a = 'WA';
  var _0x3e5c4b = document.getElementById('io_form' + input).value;
  var _0x251304 = Main(_0x3e5c4b);
  if (_0x251304 == Main(document.getElementById('io_form' + input).value.split('\n')[0])) {
    _0x4d024a = 'AC';
  }
  document.getElementById('io_form' + input).value = _0x4d024a;
}
