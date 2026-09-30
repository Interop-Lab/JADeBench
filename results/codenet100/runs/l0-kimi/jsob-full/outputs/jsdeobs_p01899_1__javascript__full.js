var input = require('fs').readFileSync('stdin', 'utf8');
var arr = input.trim().split('\n');
var [n, d] = arr.shift().split(' ').map(Number);
var p = arr.shift().split(' ').map(Number);
var sum = 0;
p.forEach(function(_0x336dcb) {
    sum += Math.min(0, _0x336dcb - d);
});
console.log(sum == 0 ? 'Yes' : sum);
