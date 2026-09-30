'use strict';

function main(input) {
    const lines = input.trim().split('\n');
    lines.shift();

    const rowCount = lines.length;
    const columnCount = lines[0].length;
    const grid = lines.map(line => line.split(''));

    const walls = [];
    for (let row = 0; row < rowCount; row++) {
        for (let column = 0; column < columnCount; column++) {
            if (grid[row][column] === '#') {
                walls.push([row, column]);
            }
        }
    }

    const distances = [];
    for (let row = 0; row < rowCount; row++) {
        for (let column = 0; column < columnCount; column++) {
            if (grid[row][column] === '.') {
                let minimumDistance = Number.MAX_SAFE_INTEGER;

                for (let index = 0; index < walls.length; index++) {
                    const wallRow = walls[index][0];
                    const wallColumn = walls[index][1];
                    const distance =
                        Math.abs(wallRow - row) +
                        Math.abs(wallColumn - column);

                    if (distance < minimumDistance) {
                        minimumDistance = distance;
                    }
                }

                distances.push(minimumDistance);
            }
        }
    }

    console.log(Math.max(...distances));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
