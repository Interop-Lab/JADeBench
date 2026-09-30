var input = require('fs').readFileSync('stdin', 'utf8');
var arr = input.trim().split('\n');
var n = arr.length - 1;
var [a, b] = [0, 1];
arr.forEach(line => {
    var [op, val] = line.split(' ').map(Number);
    if (op == 1) {
        b *= val;
        a *= val;
    } else if (op == 2) {
        a -= val;
    } else if (op == 3) {
        a += val;
    }
});
console.log(a + ' ' + b);
