function main(input) {
    const digits = input.toString().split('');
    let digitSum = 0;

    for (let i = 0; i < digits.length; i++) {
        digitSum += parseInt(digits[i]);
    }

    if (parseInt(input) % digitSum == 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
