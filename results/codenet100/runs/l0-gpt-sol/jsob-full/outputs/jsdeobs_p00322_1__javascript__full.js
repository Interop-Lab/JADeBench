const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const expectedDigits = input.trim().split(' ').map(Number);

let count = 0;

for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
        for (let c = 1; c <= 9; c++) {
            for (let d = 1; d <= 8; d++) {
                for (let e = 1; e <= 9; e++) {
                    for (let f = 1; f <= 9; f++) {
                        const resultDigits = String(
                            a + c + f + (b + e) * 10 + d * 100
                        ).split('').map(Number);

                        if (resultDigits.length != 3) {
                            continue;
                        }

                        const digits = [a, b, c, d, e, f].concat(resultDigits);

                        const isValid = digits.every(function (digit, index) {
                            return (
                                (expectedDigits[index] == digit ||
                                    expectedDigits[index] == -1) &&
                                digits.indexOf(index + 1) >= 0
                            );
                        });

                        if (isValid) {
                            count++;
                        }
                    }
                }
            }
        }
    }
}

console.log(count);
