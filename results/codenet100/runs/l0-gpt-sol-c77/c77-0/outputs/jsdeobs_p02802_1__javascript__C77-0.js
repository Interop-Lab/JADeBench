'use strict';

function Main(input) {
    const lines = input.split('\n');
    const recordCount = lines.shift().split(' ')[1];
    const recordsByKey = {};

    for (let i = 0; i < recordCount; i++) {
        const key = lines[i].split(' ')[0];
        const value = lines[i].split(' ')[1];

        if (recordsByKey[key] === undefined) {
            recordsByKey[key] = '' + value;
        } else {
            recordsByKey[key] += ',' + value;
        }
    }

    let keysWithAC = 0;
    let valuesBeforeAC = 0;
    const keys = Object.keys(recordsByKey);

    for (let i = 0; i < keys.length; i++) {
        const values = recordsByKey[keys[i]].split(',');

        for (let j = 0; j < values.length; j++) {
            if (values[j] == 'AC') {
                keysWithAC++;
                break;
            }

            valuesBeforeAC++;
        }
    }

    console.log(keysWithAC + ' ' + valuesBeforeAC);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
