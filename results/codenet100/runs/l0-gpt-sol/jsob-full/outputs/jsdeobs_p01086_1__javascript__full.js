const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
    const count = lines.shift() - 0;

    if (count === 0) {
        break;
    }

    const lengths = lines.splice(0, count).map(line => line.length);

    for (let start = 0; start < lengths.length; start++) {
        const targetSums = [5, 7, 5, 7, 7];
        let sum = 0;

        for (let end = start; end < lengths.length; end++) {
            if (targetSums.length === 0) {
                break;
            }

            sum += lengths[end];

            if (sum < targetSums[0]) {
                continue;
            }

            if (sum > targetSums[0]) {
                break;
            }

            targetSums.shift();
            sum = 0;
        }

        if (targetSums.length === 0) {
            console.log(start + 1);
            break;
        }
    }
}
