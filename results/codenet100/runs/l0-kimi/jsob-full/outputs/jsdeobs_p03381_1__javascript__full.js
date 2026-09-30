function Main(input) {
    const lines = input.split('\n');
    let n = parseInt(lines[0]);
    let arr = lines[1].split(' ').map(function(x) {
        return parseInt(x);
    });
    let sorted = arr.sort(function(a, b) {
        return a - b;
    });
    const median = sorted[Math.floor((n - 1) / 2)];
    const nextMedian = sorted[n / 2];
    arr.forEach(function(x) {
        console.log(x <= median ? nextMedian : median);
    });
}
Main(require('fs').readFileSync('stdin', 'utf8'));
