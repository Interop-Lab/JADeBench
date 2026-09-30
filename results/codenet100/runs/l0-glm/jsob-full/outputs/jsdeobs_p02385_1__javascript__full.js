var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.trim().split('\n');
var diceA = Arr[0].split(' ').map(Number);
var diceB = Arr[1].split(' ').map(Number);
var NSEW = 'NSEW'.split('');

function move(direction, dice) {
    var top = dice[0];
    var north = dice[1];
    var west = dice[2];
    var east = dice[3];
    var south = dice[4];
    var bottom = dice[5];
    var result = [];

    if (direction == 'S') result = [north, bottom, west, east, top, south];
    if (direction == 'W') result = [east, north, south, bottom, west, top];
    if (direction == 'E') result = [west, south, bottom, top, north, east];
    if (direction == 'N') result = [south, top, west, east, bottom, north];

    return result;
}

for (var i = 0; i < 256; i++) {
    var r = Math.floor(Math.random() * 4);
    diceA = move(NSEW[r], diceA);
    var flag = diceA.some(function (a, b) {
        return a == diceB[b];
    });
    if (flag) break;
}

console.log(flag ? 'Yes' : 'No');
