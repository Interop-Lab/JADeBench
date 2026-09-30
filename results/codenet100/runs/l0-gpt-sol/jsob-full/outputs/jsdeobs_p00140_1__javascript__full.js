var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.replace(/\n$/, '').split('\n');
var n = lines.shift() - 0;

for (var i = 0; i < n; i++) {
    var values = lines[i].split(' ').map(Number);
    var current = values[0];
    var goal = values[1];
    var direction = 1;
    var answer = [current];

    if (current < goal) {
        do {
            current++;
            answer.push(current);
        } while (current != goal);
    } else if (current > goal && current <= 5) {
        do {
            current--;
            answer.push(current);
        } while (current != goal);
    } else if (current > goal && current >= 6 && goal >= 6) {
        do {
            current++;
            if (current == 10) {
                current = 5;
            }
            answer.push(current);
        } while (current != goal);
    } else if (current > goal && current >= 6 && goal <= 5) {
        do {
            current += direction;
            if (current == 10) {
                current = 5;
                direction = -1;
            }
            answer.push(current);
        } while (current != goal);
    }

    console.log(answer.join(' '));
}
