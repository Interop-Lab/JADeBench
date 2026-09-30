'use strict';

const encodedStrings = [
    'WRXsWPlcVSoYAx8',
    'W55AW6XPWPiHW4S',
    'xGhcLgutv2emWP3dVgGG',
    'W4lcHenog1DgWOjpvCk1rSkB',
    'WOdcH2JcH3dcOSo6',
    'lSkCW7HP',
    'W5maWQVdQSoAW5LSWPjD',
    'WOybkCkUWPL4vbG',
    'W7zBASo0W584FqhdJh4WW7y',
    'W5NdQ8oorWhdKCodkflcNa',
    'a8ovlG',
    'aCoOiJbTWOdcUCoTW4SCWPNdRq',
    'W4GFWO3dGCoYlt/cVq',
    'pXBdQCkaWOGkWRFcMfZdTemh',
    'W6xdVmk0W6m',
    'l0pdHhnNfN5g',
    'WOKMWQvRWRBdImonWO3cNx8',
    'W6BcJL0RWRpdVSoakq',
    'amoZWOVdO8k5W6buB8oGg8kggq',
    'WRVcLSkRcvtcHLK',
    'l8oNACofWPddQCkavcqvoCo8',
    'l8oKACobWPxdOCo5AtiBcCotaG',
    'WOZcSmkD',
    'WQpcV8oHW6TIWPJdUhNdQfz+ia',
    'W5inWQFcImkYWPrtWP1jfvKw',
    'W4NdJSkO',
    'o8kpW6euW6rsqW',
    'pZfSaf7cPwifkCk0Dmk6',
    'BHpdNCocWQ0VW5mjmhddGJa',
    'WOvPxSoSWOTvW5uMtW'
];

const decodedStrings = {};

function decodeCustomBase64(input) {
    const alphabet =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
    const bytes = [];
    let bits = 0;
    let bitCount = 0;

    for (const character of input) {
        const value = alphabet.indexOf(character);
        if (value < 0 || value === 64) {
            continue;
        }

        bits = bits * 64 + value;
        bitCount += 6;

        if (bitCount >= 8) {
            bitCount -= 8;
            bytes.push((bits >> bitCount) & 0xff);
            bits &= (1 << bitCount) - 1;
        }
    }

    let encoded = '';
    for (const byte of bytes) {
        encoded += '%' + byte.toString(16).padStart(2, '0');
    }
    return decodeURIComponent(encoded);
}

function rc4Decrypt(input, key) {
    const data = decodeCustomBase64(input);
    const state = Array.from({ length: 256 }, (_, index) => index);
    let j = 0;

    for (let i = 0; i < 256; i++) {
        j = (j + state[i] + key.charCodeAt(i % key.length)) % 256;
        [state[i], state[j]] = [state[j], state[i]];
    }

    let i = 0;
    j = 0;
    let result = '';

    for (let position = 0; position < data.length; position++) {
        i = (i + 1) % 256;
        j = (j + state[i]) % 256;
        [state[i], state[j]] = [state[j], state[i]];

        const keyByte = state[(state[i] + state[j]) % 256];
        result += String.fromCharCode(data.charCodeAt(position) ^ keyByte);
    }

    return result;
}

function decodeString(index, key) {
    const cacheKey = index + encodedStrings[0];

    if (!decodedStrings[cacheKey]) {
        decodedStrings[cacheKey] = rc4Decrypt(encodedStrings[index], key);
    }

    return decodedStrings[cacheKey];
}

while (true) {
    try {
        const checksum =
            parseInt(decodeString(12, 'Lhdp')) *
                (-parseInt(decodeString(9, 'Qn04')) / 2) +
            parseInt(decodeString(13, 'KmyG')) / 3 +
            (-parseInt(decodeString(15, 'SMyf')) / 4) *
                (-parseInt(decodeString(2, 'WPOp')) / 5) -
            parseInt(decodeString(24, 'qnSJ')) / 6 -
            parseInt(decodeString(10, '%CpS')) / 7 +
            (-parseInt(decodeString(16, 'p86#')) / 8) *
                (-parseInt(decodeString(18, '3)wW')) / 9 +
            parseInt(decodeString(7, 'CiAe')) / 10;

        if (checksum === 107001) {
            break;
        }

        encodedStrings.push(encodedStrings.shift());
    } catch (error) {
        encodedStrings.push(encodedStrings.shift());
    }
}

const input = require('fs')[
    decodeString(28, '!lR^') + decodeString(21, 'nWjD')
](decodeString(3, 'V4Zt') + 'in', decodeString(0, 'Qn04'));

let result = decodeString(23, 'qnSJ') + 's ';

switch (input) {
    case '22':
        result += decodeString(1, '3)wW') + decodeString(26, 'kRgx');
        break;
    case '23':
        result += decodeString(17, '8sKT');
        break;
    case '24':
        result += decodeString(11, '@7fq');
        break;
    case '25':
        break;
}

console[decodeString(8, 'wulY')](result);
