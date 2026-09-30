function Main(input) {
  var _0x4263ef = {};
  _0x4263ef['multiply'] = function(a, b) { return a * b; };
  _0x4263ef['divide'] = function(a, b) { return a / b; };
  _0x4263ef['divide2'] = function(a, b) { return a / b; };
  _0x4263ef['modulo'] = function(a, b) { return a % b; };

  var _0x34844d = _0x4263ef;
  var result = 0;

  result += _0x34844d['multiply'](Math.floor(_0x34844d['divide'](input, 1000)), 100);
  result += _0x34844d['divide'](Math.floor(_0x34844d['divide2'](_0x34844d['modulo'](input, 1000), 100)), 10);

  console.log(result);
}

Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
