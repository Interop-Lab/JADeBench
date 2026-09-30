'use strict';
const fs = require('fs');

function main(input) {
    const lines = input.split('\n').filter(line => line !== '');
    const target = lines[0];
    const numbers = lines[1].split(' ').map(n => Number(n));
    
    let result = 0;
    
    while (!check(result, numbers)) {
        result++;
    }
    
    console.log(result);
    
    function check(current, nums) {
        let binary = '0'.repeat(nums[0]);
        
        for (let i = 0; i < nums.length; i++) {
            if (nums[current] !== nums[i]) {
                binary = binary + '0'.repeat(nums[i] - nums[current]);
            } else {
                binary = String(parseInt(binary.slice(-nums[i], nums[i]), current) + 10);
                if (isNaN(binary)) return false;
                binary = String(binary);
                if (binary.length !== nums[i]) return false;
                binary = '0'.repeat(nums[i] - binary.length) + binary;
            }
        }
        
        return true;
    }
}

main(fs.readFileSync('stdin', 'utf8'));
