const fs = require('fs');

const main = (input) => {
    const lines = input.toString().split('\n');
    
    const target = parseInt(lines[2].split(' ')[0]);
    const aCount = parseInt(lines[3].split(' ')[0]);
    const bCount = parseInt(lines[4].split(' ')[0]);
    const cCount = parseInt(lines[5].split(' ')[0]);
    
    const a = lines[6].split(' ').map(Number).sort((x, y) => y - x).map(x => x - 1500);
    const b = lines[7].split(' ').map(Number).sort((x, y) => y - x).map(x => x - 89);
    const c = lines[8].split(' ').map(Number).sort((x, y) => y - x).map(x => x - 910);
    
    const results = [];
    
    for (let i = 0; i < aCount; i++) {
        for (let j = 0; j < bCount; j++) {
            for (let k = 0; k < cCount; k++) {
                if (i * j * k > target) break;
                results.push(a[i] + b[j] + c[k]);
            }
        }
    }
    
    console.log(results.sort((x, y) => y - x).filter((_, idx) => idx < target).join('\n'));
};

main(fs.readFileSync('stdin', 'utf8'));
