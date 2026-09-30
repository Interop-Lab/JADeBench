function Main(input) {
  var _0x4263ef = {};
  _0x4263ef['multiply'] = function(a, b) { return a * b; };
  _0x4263ef['divide'] = function(a, b) { return a / b; };
  _0x4263ef['divide2'] = function(a, b) { return a / b; };
  _0x4263ef['modulo'] = function(a, b) { return a % b; };

  var _0x34844d = _0x4263ef;
  var _0x5d624f = 0;

  _0x5d624f += _0x34844d['multiply'](Math['floor'](_0x34844d['divide'](input, 1000)), 1000);
  _0x5d624f += _0x34844d['divide2'](Math['floor'](_0x34844d['modulo'](_0x34844d['divide'](input, 100), 10)), 100);

  console['log'](_0x5d624f);
}

Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
