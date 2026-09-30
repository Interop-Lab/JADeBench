'use strict';
function Main(input) {
    const conditions = {
        check1: function(a, b) { return a == b; },
        check2: function(a, b) { return a == b; },
        check3: function(a, b) { return a == b; },
        result: 'YES'
    };
    const firstLine = input.split('\n')[0];
    if (conditions.check1(firstLine, 42) || conditions.check2(firstLine, 13) || conditions.check3(firstLine, 7)) {
        console.log(conditions.result);
    } else {
        console.log('NO');
    }
}
Main(require('fs').readFileSync('stdin', 'utf8'));
