var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.trim().split('\n');
var diceA = Arr[0].split(' ').map(Number);
var diceB = Arr[1].split(' ').map(Number);
var NSEW = 'NSEW'.split('');

for (var i = 0; i < 100; i++) {
    var r = Math.floor(Math.random() * 4);
    diceA = move(NSEW[r], diceA);
    var flag = diceA.some(function (x, idx) {
        return x == diceB[idx];
    });
    if (flag) break;
}

console.log(flag ? 'Yes' : 'No');

function move(direction, dice) {
    var a = dice[0];
    var b = dice[1];
    var c = dice[2];
    var d = dice[3];
    var e = dice[4];
    var f = dice[5];
    var result = [];
    if (direction == 'S') result = [a, b, c, d, e, f];
    if (direction == 'W') result = [c, f, d, b, a, e];
    if (direction == 'E') result = [d, e, b, c, a, f];
    if (direction == 'N') result = [e, f, c, d, b, a];
    return result;
}
