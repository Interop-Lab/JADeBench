var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

while (true) {
    var count = lines.shift() - 0;
    if (count === 0) {
        break;
    }

    var lengths = lines.splice(0, count).map(function (line) {
        return line.length;
    });

    for (var start = 0; start < lengths.length; start++) {
        var targets = [5, 7, 5, 7, 7];
        var sum = 0;

        for (var end = start; end < lengths.length; end++) {
            if (targets.length === 0) {
                break;
            }

            sum += lengths[end];

            if (sum < targets[0]) {
                continue;
            }

            if (sum > targets[0]) {
                break;
            }

            targets.shift();
            sum = 0;
        }

        if (targets.length === 0) {
            console.log(start + 1);
            break;
        }
    }
}
