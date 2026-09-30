const encodedStrings = [
  'EmoAW5OE',
  'W4C/WOaYW7hcTCk8W7JcPmojW7bPW5K',
  'xLtdOYO',
  'WPKTWRRdLmkc',
  'wSk1tsBdRConcgCvCahcOMq',
  'u8kkB8oWyfhcQtVcTCoLWOX0',
  'emoZbmoxW5C',
  'f8kqWRW9DdBdGYxcNCkIuSk+WQi',
  'WRmCW7rkW7JcTZNdUI1lh24',
  'vWZdS8ojnH96',
  'pCoWW5tcUu45W74pWO4',
  'vM7dSuXDz8oZ',
  'WOVdKZBdVhJcN8oQWPe',
  'bxpdKMf1uW',
  'W7ddVmk1C2aqANxcUNlcKCoT',
  'dSoIga',
  'h8oEn0JcVa',
  'WP/cM3RcUGa',
  'WQjtWRm5EmkWW4ddRmkYe1FcHSk5',
  'WQfvWRyZE8kYW4pdPSkhf3lcJ8kq',
  'W45OWQJcJSkp',
  'udvYw8opnKK',
  'W4JcGMtdMv/cSSoHWPfj',
  'rSoHWQpcQ8kYx8oI',
  'o8krWR8mWPBdSCkTW6i',
  'W6VdGCoinCkv',
  'vcrsAmo7oL8',
  'AmkppWVdMmo9EHCKa2tcL8k3',
  'sCopW68',
  'W4q7WOC0W7VcUCk9W7BcI8oiW4LNW5S',
  'W45zxq',
  'AmkooWRdLSoYCt0oj3dcJmkf',
  'yCkLWPC',
  'W5LVW6/cHCobW4BcSCoiWQLeqNmJ',
  'qmkAW4tdVSorkCo/qquysca',
  'pSo3W5xdGbPjWQKMWPmGwvtdJG',
  'm8o7WOBcLq',
  'pCkEWPhcQuO1W4S',
  'WPbKW4feWQJdR8oS',
  'WP7dSmo4zsb4W7yw',
  'zJWho8oHW47dTmkV'
];

function decodeBase64(value) {
  const alphabet =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
  let bytes = '';
  let bitCount = 0;
  let accumulator;

  for (let index = 0; index < value.length; index++) {
    const digit = alphabet.indexOf(value.charAt(index));

    if (digit < 0) {
      continue;
    }

    if (bitCount % 4) {
      accumulator = accumulator * 64 + digit;
      bitCount++;
      bytes += String.fromCharCode(
        255 & (accumulator >> ((-2 * bitCount) & 6))
      );
    } else {
      accumulator = digit;
      bitCount++;
    }
  }

  let encoded = '';

  for (let index = 0; index < bytes.length; index++) {
    encoded +=
      '%' + ('00' + bytes.charCodeAt(index).toString(16)).slice(-2);
  }

  return decodeURIComponent(encoded);
}

function decrypt(value, key) {
  const ciphertext = decodeBase64(value);
  const state = Array.from({ length: 256 }, (_, index) => index);
  let j = 0;

  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key.charCodeAt(i % key.length)) % 256;
    [state[i], state[j]] = [state[j], state[i]];
  }

  let i = 0;
  j = 0;
  let plaintext = '';

  for (let index = 0; index < ciphertext.length; index++) {
    i = (i + 1) % 256;
    j = (j + state[i]) % 256;
    [state[i], state[j]] = [state[j], state[i]];

    const keyByte = state[(state[i] + state[j]) % 256];
    plaintext += String.fromCharCode(
      ciphertext.charCodeAt(index) ^ keyByte
    );
  }

  return plaintext;
}

function decodedNumber(index, key) {
  return parseInt(decrypt(encodedStrings[index], key));
}

while (true) {
  const checksum =
    -decodedNumber(0, 'Esex') * (decodedNumber(5, '%gs^') / 2) +
    decodedNumber(1, '%gs^') / 3 -
    (decodedNumber(34, 'b1OV') / 4) *
      (-decodedNumber(38, '0NGF') / 5) +
    (decodedNumber(23, 'U)jb') / 6) *
      (decodedNumber(14, 'fqGh') / 7) -
    (decodedNumber(24, 'FIHX') / 8) *
      (decodedNumber(22, 'RZ4p') / 9) +
    (decodedNumber(20, 'e*^G') / 10) *
      (decodedNumber(37, '4qae') / 11) -
    decodedNumber(7, 'eI65') / 12;

  if (checksum === 391805) {
    break;
  }

  encodedStrings.push(encodedStrings.shift());
}

const zeroResult = decrypt(encodedStrings[28], 'G5ME');
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const [, threshold] = lines.shift().split(' ').map(Number);
const values = lines.shift().split(' ').map(Number);

let sum = 0;

values.forEach(value => {
  sum += Math.max(0, value - threshold);
});

console.log(sum === 0 ? zeroResult : sum);
