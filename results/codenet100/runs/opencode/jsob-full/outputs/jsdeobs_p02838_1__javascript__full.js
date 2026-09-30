"use strict";

const fs = require("fs");

const UINT32_RANGE = 0x100000000;
const SIGN_BIT = 0x80000000;
const OUTPUT_MODULUS = 1000000007;

function Main(input) {
  const lines = input.split("\n");
  const valueCount = parseInt(lines[0], 10);
  const lowWords = lines[1].split(" ");
  const highWords = new Array(valueCount);

  for (let index = 0; index < valueCount; index++) {
    const value = parseInt(lowWords[index], 10);
    highWords[index] = Math.floor(value / UINT32_RANGE);
    lowWords[index] = value % UINT32_RANGE;
  }

  let lowWordXorSum = 0;
  let highWordXorSum = 0;

  for (let left = 0; left < valueCount - 1; left++) {
    for (let right = left + 1; right < valueCount; right++) {
      // JavaScript's XOR produces a signed 32-bit value. The original
      // algorithm carries each accumulated half-range into the high sum.
      lowWordXorSum += lowWords[left] ^ lowWords[right];

      if (lowWordXorSum > SIGN_BIT) {
        lowWordXorSum %= SIGN_BIT;
        highWordXorSum += 0.5;
      }

      highWordXorSum += highWords[left] ^ highWords[right];
    }
  }

  const xorSum = lowWordXorSum + highWordXorSum * UINT32_RANGE;
  console.log(xorSum % OUTPUT_MODULUS);
}

Main(fs.readFileSync("/dev/stdin", "utf8"));
