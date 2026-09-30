function Main(input) {
    const chars = input.split('');
    let values = [];
    let result = [];

    for (let i = 0; i < chars.length; i++) {
        values.push(0);
        result.push(0);
    }

    let current = result.slice();

    for (let step = 0; step < values.length - Math.floor(values.length / 2); step++) {
        for (let i = 0; i < values.length; i++) {
            if (chars[i] === 'R') {
                current[i] += values[i];
            } else if (chars[i] === 'L') {
                current[i] += values[i];
            }
        }
        values = current.slice();
        current = result.slice();
    }

    console.log(values.join(' '));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
