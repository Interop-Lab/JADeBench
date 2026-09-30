function Main(input) {
    var chars = input.split('');
    var counts = [];
    var result = [];
    
    for (let i = 0; i < chars.length; i++) {
        counts.push(0);
        result.push(0);
    }
    
    var current = result.slice();
    
    for (let round = 0; round < counts.length - (counts.length % 2); round++) {
        for (let pos = 0; pos < counts.length; pos++) {
            if (chars[pos] === 'R') {
                current[(pos + 1) % counts.length] += counts[pos];
            } else if (chars[pos] === 'L') {
                current[(pos - 1 + counts.length) % counts.length] += counts[pos];
            }
        }
        counts = current.slice();
        current = result.slice();
    }
    
    console.log(counts.join(' '));
}

Main(require('fs').readFileSync('stdin', 'utf-8'));
