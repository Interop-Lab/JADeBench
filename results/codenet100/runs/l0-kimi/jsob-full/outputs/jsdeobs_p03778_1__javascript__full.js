'use strict';
const fs = require('fs');

const main = (input) => {
    const nums = input.split(' ').map(x => parseInt(x));
    const a = nums[0];
    const b = nums[1];
    const c = nums[2];
    
    const sum1 = b + a;
    const sum2 = c + a;
    
    let arr;
    if (b <= c) {
        arr = [b, sum1, c, sum2];
    } else {
        arr = [c, sum2, b, sum1];
    }
    
    if (arr[0] < arr[3]) {
        console.log(arr[1] + arr[2]);
    } else {
        console.log(-1);
    }
};

main(fs.readFileSync('stdin', 'utf8'));
