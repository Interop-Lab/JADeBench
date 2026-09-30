'use strict';
const main = _0xb04fb2 => {
  _0xb04fb2 = _0xb04fb2.trim().split('\n');
  const _0x151fbd = parseInt(_0xb04fb2[0].split(' ')[0]);
  let _0xa7323a = _0xb04fb2[1].split(' ').map(_0x5a6579 => parseInt(_0x5a6579)).sort((_0x115ad2, _0x23415d) => _0x23415d - _0x115ad2);
  const _0x380a27 = _0xa7323a.shift(), _0x5bf877 = _0xa7323a.reduce((_0xc5d0b4, _0x4e23a) => _0xc5d0b4 + _0x4e23a);
  console.log(_0x151fbd === _0x380a27 + _0x5bf877 ? 'Yes' : 'No');
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
