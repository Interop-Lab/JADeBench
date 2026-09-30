function Main(input) {
    const lines = input.split('\n');
    const count = parseInt(lines[0], 10);
    const lowParts = lines[1].split(' ');
    const highParts = new Array(count);

    const TWO_31 = 2147483648;
    const TWO_32 = 4294967296;
    const MODULUS = 1000000007;

    for (let i = 0; i < count; i++) {
        lowParts[i] = parseInt(lowParts[i], 10);
        highParts[i] = Math.floor(lowParts[i] / TWO_32);
        lowParts[i] %= TWO_32;
    }

    let lowTotal = 0;
    let highTotal = 0;

    for (let i = 0; i < count - 1; i++) {
        for (let j = i + 1; j < count; j++) {
            lowTotal += lowParts[i] ^ lowParts[j];

            if (lowTotal > TWO_31) {
                lowTotal %= TWO_31;
                highTotal += 0.5;
            }

            highTotal += highParts[i] ^ highParts[j];
        }
    }

    lowTotal += highTotal * TWO_32;
    console.log(lowTotal % MODULUS);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
