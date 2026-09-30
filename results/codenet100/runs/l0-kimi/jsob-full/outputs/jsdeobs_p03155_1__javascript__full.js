var fs = require('fs');

function Main(input) {
    var numbers = input.split('\n').map(Number);
    console.log((numbers[0] * -0x355 * 0x6 + 0x26e4 + -0x12e5) - numbers[1] + (numbers[2] * -0x671 * 0x2 + -0x1665 + 0x2348) - numbers[3]);
}

Main(fs.readFileSync('stdin', 'utf8').trim());
