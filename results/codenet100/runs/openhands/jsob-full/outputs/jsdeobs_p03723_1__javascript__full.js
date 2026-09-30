'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const tokens = input.split(/ |\n/);
let tokenIndex = 0;

function readNumbers(count) {
  const values = tokens.slice(tokenIndex, (tokenIndex += count));
  return values.map((value) => +value);
}

const deadline = +new Date() + 900;
const output = countCookieExchanges();

if (output !== undefined) {
  console.log(String(output));
}

function countCookieExchanges() {
  let [cookiesA, cookiesB, cookiesC] = readNumbers(3);
  let exchangeCount = 0;

  while (new Date() < deadline) {
    if (cookiesA % 2 || cookiesB % 2 || cookiesC % 2) {
      return exchangeCount;
    }

    const nextA = (cookiesB + cookiesC) >> 1;
    const nextB = (cookiesA + cookiesC) >> 1;
    const nextC = (cookiesA + cookiesB) >> 1;

    cookiesA = nextA;
    cookiesB = nextB;
    cookiesC = nextC;
    exchangeCount++;
  }

  return -1;
}
