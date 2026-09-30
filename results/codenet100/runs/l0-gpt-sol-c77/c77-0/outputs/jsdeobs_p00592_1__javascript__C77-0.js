function time(value) {
    var digits = value.split('').map(Number);
    return digits[0] * 10 * 60
        + digits[1] * 60
        + digits[2] * 10
        + digits[3];
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

while (true) {
    var caseHeader = lines.shift();

    if (caseHeader == '0 0 0') {
        break;
    }

    var caseValues = caseHeader.split(' ');
    var participantCount = caseValues[0] - 0;
    var periodStart = time(caseValues[1]);
    var periodEnd = time(caseValues[2]);
    var availabilityCounts = [];

    for (var minute = periodStart; minute < periodEnd; minute++) {
        availabilityCounts[minute] = 0;
    }

    for (var participant = 0; participant < participantCount; participant++) {
        var intervalCount = lines.shift();
        var intervals = lines.shift().split(' ');

        for (var interval = 0; interval < intervalCount; interval++) {
            var start = time(intervals.shift());
            var stop = time(intervals.shift());

            for (var minute = start; minute < stop; minute++) {
                availabilityCounts[minute]++;
            }
        }
    }

    var longest = 0;
    var current = 0;

    for (var minute = periodStart; minute < periodEnd; minute++) {
        if (availabilityCounts[minute] != participantCount) {
            current++;
        } else {
            longest = Math.max(longest, current);
            current = 0;
        }
    }

    longest = Math.max(longest, current);
    console.log(longest);
}
