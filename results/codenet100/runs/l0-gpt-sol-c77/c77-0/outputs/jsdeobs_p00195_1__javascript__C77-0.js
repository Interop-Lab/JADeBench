var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');
var scores = [];

for (var i = 0; i < lines.length; i++) {
    if (scores.length == 0 && lines[i] == '0 0') {
        break;
    }

    if (scores.length == 4) {
        var candidates = 'ABCD'.split('');
        var maxScore = scores.reduce(function (left, right) {
            return Math.max(left, right);
        });
        var winner = candidates[scores.indexOf(maxScore)];

        console.log(winner + ' ' + maxScore);
        scores = [];
    } else {
        var values = lines[i].split(' ').map(Number);
        scores.push(values[0] + values[1]);
    }
}
