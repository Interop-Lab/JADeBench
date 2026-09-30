function time(value) {
    var digits = value.split('').map(Number);

    return (
        (digits[0] * 10 + digits[1]) * 60 +
        digits[2] * 10 +
        digits[3]
    );
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

while (true) {
    var header = lines.shift();

    if (header == '0') {
        break;
    }

    header = header.split(' ');

    var n = header[0] - 0;
    var periodStart = time(header[1]);
    var periodEnd = time(header[2]);
    var counts = [];

    for (var minute = periodStart; minute < periodEnd; minute++) {
        counts[minute] = 0;
    }

    for (var person = 0; person < n; person++) {
        var intervalCount = lines.shift();
        var intervals = lines.shift().split(' ');

        for (var interval = 0; interval < intervalCount; interval++) {
            var start = time(intervals.shift());
            var stop = time(intervals.shift());

            for (var minute = start; minute < stop; minute++) {
                counts[minute]++;
            }
        }
    }

    var maxLength = 0;
    var currentLength = 0;

    for (var minute = periodStart; minute < periodEnd; minute++) {
        if (counts[minute] != n) {
            currentLength++;
        } else {
            maxLength = Math.max(maxLength, currentLength);
            currentLength = 0;
        }
    }

    maxLength = Math.max(maxLength, currentLength);
    console.log(maxLength);
}
