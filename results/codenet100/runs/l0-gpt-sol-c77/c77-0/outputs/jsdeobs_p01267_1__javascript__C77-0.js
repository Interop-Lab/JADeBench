const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');

while (true) {
    const parameters = lines.shift().split(' ').map(Number);

    if (parameters.join('') == '00000') {
        break;
    }

    const values = lines.shift().split(' ').map(Number);
    const multiplier = parameters[1];
    const modulus = parameters[2];
    const increment = parameters[3];
    let current = parameters[4];
    let count = 0;

    while (true) {
        if (values[0] == current) {
            values.shift();
        }

        if (values.length == 0) {
            console.log(count);
            break;
        }

        current = (multiplier * current % modulus) + increment;
        count++;

        if (count === 10001) {
            console.log(-1);
            break;
        }
    }
}
