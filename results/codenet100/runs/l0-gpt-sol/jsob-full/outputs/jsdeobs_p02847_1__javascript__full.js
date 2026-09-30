const encodedStrings = [
  'W4ONmhex',
  'WPBcOmoB',
  'W4FdICkmWQ0',
  'l8oIWQCYW4VdHSkSca',
  'wuz/',
  'WQKjWPRcSMi',
  'W6hdTry9W74',
  'hCoya8klEG',
  'p8ouWOdcG8kvc8o7FfqVemoJ',
  'oYPsW6ddJ8oCW7tcVG',
  'WOxcMexdG8ozfMqWWR44WPGUWPO',
  'WPBcLrO3W48rW7rAxsn9Aa',
  'W4NdHCoWwq',
  'wxDjqw0',
  'W5RdMSoiW4dcNCo1WPBdVW',
  'BCoLibhcHY3cKgy',
  'WPO7CCkcW4WNWO7cLW',
  'nCklWPS',
  'WQOcWONcLc/cO01sWRXcjCk+',
  'WR1Gg8krir7cKsL5W7xcHaO',
  'tgGkfXldLSkTFCoFW7H6WQ1I',
  'BCoPDxhdI1FcG2KTxbii',
  'pCotWOxcG8ksc8o1r046kSoV',
  'WOHcorjm',
  'sSk0W7O',
  'k8oNW5jIWQZcLSkYfhDEW7zr',
  'FSkdW5ldKmoHu8oqwG',
  'WR9GW4NdQgy',
  'qu4+W7OYW6ldSCo2smoSW6zX',
  'WOBdRCoa',
  'z28CW4JcUa',
  'kCoGW55LWQNcKSoBuwbFW7zCW4xdLW',
  'W4BcJSoGW6ddMmomWPFdIG',
  'fCkNWPTMW5a',
  'WQyiWPZcHee',
  'W7VdLv8',
  'W4BdIsdcHCkq',
  'W6xcV1DMW64',
  'lCoKW7q',
  'p8owW77dOSonCmojBG',
  'bLFcNfZcKmo/nM9XD8kaWO1fWOC',
  'W43cVtRcSmodWO1EbCo9W6ZcQ8kX',
  'u03cKW',
  'rrhdPmo7W7uXW7RdN8oVW4NdU1e'
];

const decodedStringCache = Object.create(null);

function decodeBase64Utf8(value) {
  const alphabet =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
  let bytes = '';
  let output = '';

  for (
    let count = 0, bits, character, position = 0;
    (character = value.charAt(position++));
  ) {
    character = alphabet.indexOf(character);

    if (
      ~character &&
      (bits = count % 4 ? bits * 64 + character : character, count++ % 4)
    ) {
      bytes += String.fromCharCode(
        255 & (bits >> ((-2 * count) & 6))
      );
    }
  }

  for (let index = 0; index < bytes.length; index++) {
    output +=
      '%' +
      ('00' + bytes.charCodeAt(index).toString(16)).slice(-2);
  }

  return decodeURIComponent(output);
}

function rc4Decrypt(value, key) {
  const state = [];
  let j = 0;
  let temporary;
  let output = '';

  value = decodeBase64Utf8(value);

  for (let i = 0; i < 256; i++) {
    state[i] = i;
  }

  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key.charCodeAt(i % key.length)) % 256;
    temporary = state[i];
    state[i] = state[j];
    state[j] = temporary;
  }

  let i = 0;
  j = 0;

  for (let position = 0; position < value.length; position++) {
    i = (i + 1) % 256;
    j = (j + state[i]) % 256;

    temporary = state[i];
    state[i] = state[j];
    state[j] = temporary;

    output += String.fromCharCode(
      value.charCodeAt(position) ^
        state[(state[i] + state[j]) % 256]
    );
  }

  return output;
}

function decodeString(code, key) {
  const index = code - 0x1d9;
  const cacheKey = index + encodedStrings[0];

  if (!decodedStringCache[cacheKey]) {
    decodedStringCache[cacheKey] = rc4Decrypt(encodedStrings[index], key);
  }

  return decodedStringCache[cacheKey];
}

while (true) {
  try {
    const checksum =
      -parseInt(decodeString(0x1e0, 'TxRj')) *
        (parseInt(decodeString(0x1fa, '8!Lh')) / 2) -
      parseInt(decodeString(0x1e4, 'GG0k')) / 3 -
      (parseInt(decodeString(0x1e3, 'k7*H')) / 4) *
        (parseInt(decodeString(0x1f8, '5Wy2')) / 5) -
      parseInt(decodeString(0x1dc, 'mHfd')) / 6 +
      parseInt(decodeString(0x1e7, '5Wy2')) / 7 -
      (parseInt(decodeString(0x1e5, 'w0Nj')) / 8) *
        (parseInt(decodeString(0x1e1, 'Lk3g')) / 7953) +
      parseInt(decodeString(0x1f9, '2^BC')) / 10;

    if (checksum === 599441) {
      break;
    }

    encodedStrings.push(encodedStrings.shift());
  } catch (error) {
    encodedStrings.push(encodedStrings.shift());
  }
}

function Main(input) {
  const values = Object.create(null);

  values[decodeString(0x1ec, 'TP^d')] = decodeString(0x201, 'rhuQ');
  values[decodeString(0x1f2, 'VZQH')] = decodeString(0x1ee, '(cx#');
  values[decodeString(0x1ef, '4]nB')] = decodeString(0x1e2, 'VZQH');
  values[decodeString(0x1e8, '$sab')] = decodeString(0x1f4, 'F)eC');
  values[decodeString(0x202, '&z%p')] = decodeString(0x1fe, '9Y)e');
  values[decodeString(0x203, 'QZ7d')] = decodeString(0x1e9, '5Wy2');
  values[decodeString(0x1f3, '&z%p')] = decodeString(0x1fb, 'LRW2');

  let result;

  switch (input) {
    case values[decodeString(0x204, 'W^#X')]:
      result = '7';
      break;
    case values[decodeString(0x1f6, 'ARZ9')]:
      result = '6';
      break;
    case values[decodeString(0x1ef, '4]nB')]:
      result = '5';
      break;
    case values[decodeString(0x1e8, '$sab')]:
      result = '4';
      break;
    case values[decodeString(0x1fd, 'dJLP')]:
      result = '3';
      break;
    case values[decodeString(0x1f5, 'xE$8')]:
      result = '2';
      break;
    case values[decodeString(0x1de, 'HJpA')]:
      result = '1';
      break;
  }

  console[decodeString(0x1f7, 'Qz^g')](result);
}

Main(
  require('fs')[
    decodeString(0x1eb, '5Wy2') + decodeString(0x1dd, 'XcHj')
  ](
    decodeString(0x1f1, 'Ekv^') + 'in',
    decodeString(0x1ff, '0Z@e')
  )
);
