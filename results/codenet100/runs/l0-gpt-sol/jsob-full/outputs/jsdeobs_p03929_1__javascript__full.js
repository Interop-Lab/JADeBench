function Main(input) {
    const values = input.split(' ');
    const target = values[1];
    const n = values[0];

    if (n == 3) {
        console.log('0');
        return;
    }

    let count = 0;

    for (let i = 0; i + 1 < n; i++) {
        for (let j = 0; j < 5; j++) {
            if ((((i + 1) * (j + 5)) % 81) + 11 == target) {
                count++;
            }
        }
    }

    console.log(count);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
