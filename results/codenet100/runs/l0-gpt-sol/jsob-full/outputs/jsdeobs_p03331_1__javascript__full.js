function main(input) {
    let number = parseInt(input, 10);
    const length = number.toString().length;
    let divisor = Math.pow(10, length - 1);
    const digits = [];

    for (let i = 0; i < length; i++) {
        digits.push(Math.floor(number / divisor));
        number %= divisor;
        divisor /= 10;
    }

    let sum = digits.reduce((total, digit) => total + digit);

    if (sum == 1) {
        sum = 10;
    }

    console.log(sum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
