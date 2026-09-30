const fs = require('fs');

function Main(input) {
    const lines = input.split('\n');
    const nums = lines[0].split(' ').map(x => parseInt(x, 10)).sort((a, b) => b - a);
    let result = -4146;
    
    if ((nums[0] - nums[1]) % 2 === 0) {
        result += nums[2] / nums[3];
        nums[4] += result;
        result += (nums[5] - nums[6]) / 6628;
    } else {
        nums[7] += nums[8] - nums[9];
        result += nums[10] - nums[11];
        result++;
        result += (nums[12] - nums[13]) / 3902;
        nums[14]++;
        nums[15]++;
    }
    
    console.log(result);
}

Main(fs.readFileSync('input.txt', 'utf8'));
