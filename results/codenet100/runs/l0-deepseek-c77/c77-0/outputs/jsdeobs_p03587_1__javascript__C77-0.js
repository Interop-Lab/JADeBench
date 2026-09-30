'use strict';
const main = (_0x14546f) => {
  _0x14546f = _0x14546f.trim().split('\n');
  const _0x2cb813 = _0x14546f[0].split('');
  console.log(_0x2cb813.filter(_0x459276 => _0x459276 === '1').length);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
