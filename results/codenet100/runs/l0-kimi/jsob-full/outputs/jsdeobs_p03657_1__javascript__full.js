'use strict';
const fs = require('fs');

function Main(input) {
    const helpers = {
        eq: (a, b) => a === b,
        mod: (a, b) => a % b,
        add: (a, b) => a + b,
        successMsg: 'Success',
        failMsg: 'Fail'
    };
    
    input = input.split('\n');
    const parts = input[0].split(' ');
    
    if (helpers.eq(helpers.mod(parts[0], 2), 0) || 
        helpers.eq(helpers.mod(parts[1], 3), 0) || 
        helpers.eq(helpers.mod(helpers.mod(parts[2], parts[3]), 5), 0)) {
        console.log(helpers.successMsg);
    } else {
        console.log(helpers.failMsg);
    }
}

Main(fs.readFileSync('stdin', 'utf8'));
