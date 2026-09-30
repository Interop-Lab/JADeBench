const fs = require('fs');

function decodeRc4String(encoded, key) {
    const alphabet =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';

    let bytes = '';
    let bits = 0;
    let bitCount = 0;

    for (const character of encoded) {
        const value = alphabet.indexOf(character);
        if (value < 0 || value === 64) {
            continue;
        }

        bits = (bits << 6) | value;
        bitCount += 6;

        if (bitCount >= 8) {
            bitCount -= 8;
            bytes += String.fromCharCode((bits >> bitCount) & 0xff);
            bits &= (1 << bitCount) - 1;
        }
    }

    let escapedBytes = '';
    for (let index = 0; index < bytes.length; index++) {
        escapedBytes +=
            '%' + ('00' + bytes.charCodeAt(index).toString(16)).slice(-2);
    }

    const ciphertext = decodeURIComponent(escapedBytes);
    const state = Array.from({ length: 256 }, (_, index) => index);

    let stateIndex = 0;
    for (let index = 0; index < 256; index++) {
        stateIndex =
            (stateIndex +
                state[index] +
                key.charCodeAt(index % key.length)) %
            256;

        [state[index], state[stateIndex]] = [state[stateIndex], state[index]];
    }

    let left = 0;
    let right = 0;
    let plaintext = '';

    for (let index = 0; index < ciphertext.length; index++) {
        left = (left + 1) % 256;
        right = (right + state[left]) % 256;

        [state[left], state[right]] = [state[right], state[left]];

        const keyByte = state[(state[left] + state[right]) % 256];
        plaintext += String.fromCharCode(
            ciphertext.charCodeAt(index) ^ keyByte
        );
    }

    return plaintext;
}

const outputLabel = decodeRc4String('W7pdRWVcLx1Vsxe', 't*x%');
const input = fs.readFileSync('/dev/stdin', 'utf8').split(' ');

for (let pass = 0; pass < 3; pass++) {
    for (let index = 0; index < 3; index++) {
        if (input[index] > input[index + 1]) {
            const value = input[index];
            input[index] = input[index + 1];
            input[index + 1] = value;
        }
    }
}

console.log(outputLabel, input[0], input[1], input[2]);
