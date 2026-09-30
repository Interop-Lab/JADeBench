var input = require('fs').readFileSync('stdin', 'utf8');
var Arr = input.toString().split('\n');
var diceA = Arr[0].split(' ').map(Number);
var diceB = Arr[1].split(' ').map(Number);
var NSEW = 'NSEW'.split('');

function move(direction, dice) {
    var top = dice[0];
    var front = dice[1];
    var right = dice[2];
    var left = dice[3];
    var back = dice[4];
    var bottom = dice[5];
    var result = [];
    
    if (direction === 'S') result = [front, bottom, right, left, top, back];
    if (direction === 'N') result = [back, top, right, left, bottom, front];
    if (direction === 'E') result = [left, front, top, bottom, back, right];
    if (direction === 'W') result = [right, front, bottom, top, back, left];
    
    return result;
}

for (var i = 0; i < 100; i++) {
    var r = Math.floor(Math.random() * 4);
    diceA = move(NSEW[r], diceA);
    var flag = diceA.every(function(val, idx) {
        return val === diceB[idx];
    });
    if (flag) break;
}

console.log(flag ? 'Yes' : 'No');
