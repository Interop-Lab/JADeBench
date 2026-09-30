'use strict';

const encryptedStrings = [
  'W7DOW40uoa',
  'qmoZWPOCW5pdPf7cKG',
  'fbhcKNyXvIqQW7H8AG',
  'WQiJyJxdMa',
  'W7X1W6OegG',
  'nmoOf2ah',
  'vmokB8ogyG',
  'yLFcGCoGW4C5vMG',
  'luhdH244',
  'W6ldPmoch3K',
  'W6vDs0W',
  'Bh0bENWPc8kcrmoKvSo6',
  'W5BcMCkLuw3cHCoDCColW6/cU2e',
  'WPGWDd4',
  'WO5Mnmk0k0jCWQjesqv/xW',
  'imolWPnCzw0vWR98pCkX',
  'W43cVmo1',
  'F8ooW6H+WRpdQr/dGmkenCooW6fb',
  'W5CMrCo1jG',
  'emkkWOaisa1dEa',
  'W518Au4D',
  'ufZcJcC',
  'lgJdNe4X',
  'WOJdGSoX',
  'E8kJWRnJtrOrWOKo',
  'W7KDzSoAbSo9EW',
  'z8kUW783jcFcOmo1',
  'WQP3W6NcJ8kH',
  'hCkvhCknamkMWPrgWPrFW6fXbxi',
  'W4VcImkiimkA',
  'mKCFWRJdQr7cHvztWQddOv8',
  'WRZdSCoHt8oR',
  'W6hcQSodkdS',
  'FmksW5q',
  'yLFdOCkrWQfHvuNcLfjLW6y',
  'meCxWRJdRbhcJ1jYWQpdM34',
  'v0ujmbBdNfzaWQFcTmoJxG',
  'WRuNoSk1vW',
  'WQeCemkBqq',
  'nHFdK3FcTNxdGq5fk3xdSmkD',
  'mKeuWRpdQr/dT2bVWPRdTw7dOa',
  'BtFcH0KUW7NdImk6dG',
  'vumboHldKY4gWPBcT8oQAGddGW',
  'W5JcN8oykJm6W7Td',
  'W4GKACoUBq',
  'WRyYlG',
  'bSoZkSoH'
];

function decrypt(encoded, key) {
  const bytes = Buffer.from(encoded, 'base64');
  let escaped = '';

  for (const byte of bytes) {
    escaped += '%' + byte.toString(16).padStart(2, '0');
  }

  const ciphertext = decodeURIComponent(escaped);
  const state = Array.from({ length: 256 }, (_, index) => index);
  let j = 0;

  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key.charCodeAt(i % key.length)) % 256;
    [state[i], state[j]] = [state[j], state[i]];
  }

  let i = 0;
  j = 0;
  let plaintext = '';

  for (let position = 0; position < ciphertext.length; position++) {
    i = (i + 1) % 256;
    j = (j + state[i]) % 256;
    [state[i], state[j]] = [state[j], state[i]];

    const keyByte = state[(state[i] + state[j]) % 256];
    plaintext += String.fromCharCode(ciphertext.charCodeAt(position) ^ keyByte);
  }

  return plaintext;
}

const rotation = encryptedStrings.findIndex((_, shift) => {
  const get = (index, key) =>
    decrypt(encryptedStrings[(index + shift) % encryptedStrings.length], key);

  return (
    get(42, 'vttF') === 'split' &&
    get(20, 'e*hR') === 'slice' &&
    get(23, '@8g9') === 'forEach'
  );
});

const decodeString = (index, key) =>
  decrypt(
    encryptedStrings[(index + rotation) % encryptedStrings.length],
    key
  );

const outputLabel = decodeString(24, 'nhVt');
const duplicateComparison = decodeString(36, '5Wlx');

function main(input) {
  const lines = input.split('\n');
  const count = parseInt(lines[0]);

  const firstCoordinates = [];
  const secondCoordinates = [];
  const radii = [];

  lines.slice(1, count + 1).forEach(line => {
    const values = line.split(' ').map(value => parseInt(value));
    firstCoordinates.push(values[0]);
    secondCoordinates.push(values[1]);
    radii.push(values[2]);
  });

  const limit = 100;

  for (let second = 0; second <= limit; second++) {
    for (let first = 0; first <= limit; first++) {
      let result = -1;

      for (let index = 0; index < count; index++) {
        const value =
          radii[index] -
          Math.abs(secondCoordinates[index] - second) -
          Math.abs(firstCoordinates[index] - first);

        if (result === -1) {
          result = value;
        } else {
          const matches =
            duplicateComparison === 'xmKyV'
              ? result === value
              : result !== value;

          if (matches) {
            result = -2;
            break;
          }
        }
      }

      if (result !== -2) {
        continue;
      }

      console.log(outputLabel, first, second, result);
    }
  }
}

main(require('fs').readFileSync('in', 'utf8'));
