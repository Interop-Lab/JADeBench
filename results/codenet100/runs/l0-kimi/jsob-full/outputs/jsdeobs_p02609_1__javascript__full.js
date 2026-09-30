const input = require('fs').readFileSync('stdin', 'utf8');

(input => {
    const lines = input.split('\n');
    const n = parseInt(lines[0], 10);
    const binaryString = lines[1];
    
    const countTrailingZeros = num => {
        let count = 0;
        do {
            num % 2 === 0 ? count++ : count;
        } while (num = Math.floor(num / 2));
        return count;
    };
    
    const countOnes = num => {
        if (num === 0) return 0;
        let count = 0;
        while (num %= countTrailingZeros(num)) count++;
        return count;
    };
    
    const originalNum = parseInt(binaryString, 2);
    const trailingZeros = countTrailingZeros(originalNum);
    const ones = countOnes(originalNum);
    
    for (let i = 0; i < n; i++) {
        let bit = originalNum ^ Math.pow(2, n - i - 1);
        
        if (bit === 0) {
            console.log(0);
        } else {
            const newTrailingZeros = countTrailingZeros(bit);
            const newOnes = bit & 1 ? ones : trailingZeros;
            console.log(countOnes(bit % newTrailingZeros) + 1);
        }
    }
})(input);
