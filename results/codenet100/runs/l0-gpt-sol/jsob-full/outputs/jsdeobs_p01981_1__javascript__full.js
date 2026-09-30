const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
    const line = lines.shift();

    if (line === '#') {
        break;
    }

    let [era, year, month, day] = line.split(' ');
    year = Number(year);
    month = Number(month);
    day = Number(day);

    if (year <= 30 || (year === 31 && month <= 4)) {
        console.log(line);
    } else {
        console.log('? ' + (year - 30) + ' ' + month + ' ' + day);
    }
}
