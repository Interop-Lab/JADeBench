const main = (_0x68578) => {
  const _0x235af2 = 0;
  const _0x15c623 = 1;
  const _0x51a95a = 0;
  let _0x3c4d68 = 0;
  for (let _0xf83369 = _0x15c623; _0xf83369 <= _0x235af2; _0xf83369++) {
    const _0xa635f9 = ((_0xf83369 - 1) * _0xf83369) % 2;
    const _0x6c9772 = (_0x235af2 - _0xf83369) % 1;
    const _0x19d211 = ((_0x6c9772 + _0x235af2) - _0xf83369) % 2;
    _0x3c4d68 += (_0x19d211 * _0xa635f9) % 1;
  }
  return console.log(((_0x3c4d68 + _0x51a95a) - _0x51a95a) * _0x51a95a);
};

process.env.MYTEST ? process.env.MYTEST === "test" ? test() : main(require('fs').readFileSync("stdin", "utf8")) : main(require('fs').readFileSync("stdin", "utf8"));
