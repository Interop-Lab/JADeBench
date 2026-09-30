'use strict';
const fs = require('fs');

function Main(input) {
    const numbers = input.toString().trim().split(' ').map(x => parseInt(x, 10));
    let a = numbers[0];
    let b = numbers[1];
    let temp = 0;
    let gcd = 0;
    let originalA = a;
    let originalB = b;
    
    if (a >= b) {
        while (b > 0) {
            let remainder = a % b;
            a = b;
            b = remainder;
        }
        gcd = a;
    } else {
        while (a > 0) {
            temp = b % a;
            b = a;
            a = temp;
        }
        gcd = b;
    }
    
    let lcm = (originalA * originalB) / gcd;
    console.log(lcm);
}

Main(fs.readFileSync('stdin', 'utf-8'));
