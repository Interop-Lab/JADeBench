var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

while (true) {
    var N = Number(lines.shift());
    if (N === 0) {
        break;
    }

    var counts = [];
    var pending = 0;

    for (var i = 0; i < N; i++) {
        counts[i] = 0;
    }

    var str = lines.shift();

    for (var i = 0; i < str.length; i++) {
        var value = str[i];
        var index = i % N;

        if (value === 'M') {
            counts[index]++;
        }

        if (value === 'S') {
            pending += counts[index] + 1;
            counts[index] = 0;
        }

        if (value === 'L') {
            counts[index] += pending + 1;
            pending = 0;
        }
    }

    counts.sort(function (a, b) {
        return a - b;
    });

    console.log(counts.join(' ') + ' ' + pending);
}
