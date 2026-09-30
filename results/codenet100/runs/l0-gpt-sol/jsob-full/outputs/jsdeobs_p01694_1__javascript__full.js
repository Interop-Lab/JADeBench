const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
    const n = Number(lines.shift());
    if (n === 0) break;

    const commands = lines.shift().split(' ');
    let left = 0;
    let right = 0;
    let target = 2;
    let count = 0;

    commands.forEach(command => {
        if (command === 'lu') {
            left = 1;
        } else if (command === 'ru') {
            right = 1;
        } else if (command === 'ld') {
            left = 0;
        } else if (command === 'rd') {
            right = 0;
        }

        if (left + right === target) {
            count++;
            target = target === 2 ? 0 : 2;
        }
    });

    console.log(count);
}
