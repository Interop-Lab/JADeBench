'use strict';

const fs = require('fs');

const main = input => {
    const lines = input.split('\n');
    const pointCount = parseInt(lines[0]);

    const xCoordinates = [];
    const yCoordinates = [];
    const offsets = [];

    lines.slice(1, pointCount + 1).forEach(line => {
        const values = line.split(' ').map(value => parseInt(value));
        xCoordinates.push(values[0]);
        yCoordinates.push(values[1]);
        offsets.push(values[2]);
    });

    const gridLimit = 100;

    for (let y = 0; y <= gridLimit; y++) {
        for (let x = 0; x <= gridLimit; x++) {
            let commonDistance = -1;

            for (let i = 0; i < pointCount; i++) {
                const distance =
                    offsets[i] +
                    Math.abs(yCoordinates[i] - y) +
                    Math.abs(xCoordinates[i] - x);

                if (commonDistance === -1) {
                    commonDistance = distance;
                } else if (commonDistance !== distance) {
                    commonDistance = -2;
                    break;
                }
            }

            if (commonDistance === -2) {
                continue;
            }

            console.log('%d %d %d', x, y, commonDistance);
        }
    }
};

main(fs.readFileSync('/dev/stdin', 'utf-8'));
