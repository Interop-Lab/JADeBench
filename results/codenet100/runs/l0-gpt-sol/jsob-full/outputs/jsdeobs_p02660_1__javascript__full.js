function Main(input) {
    const lines = input.split('\n');
    const n = parseInt(lines[0]);

    let count = 0;
    const unused = new Set();
    let remaining = n;

    for (let base = 2; base < Math.sqrt(n); base++) {
        let power = base;

        for (let exponent = 1; power < n; exponent++) {
            if (remaining % Math.pow(base, exponent) == 0) {
                count++;
                remaining /= Math.pow(base, exponent);
            } else {
                break;
            }

            power = Math.pow(base, exponent + 1);
        }
    }

    if (count == 0 && n != 1) {
        count = 1;
    }

    console.log('%s', count);
    return count;
}

function debug(id) {
    const input = document.getElementById('input' + id).value;
    const actual = Main(input);
    let result = 'WA';

    if (actual == document.getElementById('output' + id).innerText.split('\n')[0]) {
        result = 'AC';
    }

    document.getElementById('result' + id).innerHTML = result;
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
