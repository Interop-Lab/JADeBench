var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split('\n');

var n = arr.shift() - 0;
var [a, b] = [0, 1];

arr.forEach(line => {
    var [operation, value] = line.split(' ').map(Number);

    if (operation == 1) {
        b *= value;
        a *= value;
    } else if (operation == 2) {
        a -= value;
    } else if (operation == 3) {
        a += value;
    }
});

console.log(a + ' ' + b);
