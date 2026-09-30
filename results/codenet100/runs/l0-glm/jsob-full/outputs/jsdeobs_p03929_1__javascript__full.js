function Main(input) {
    var parts = input.split(' ');
    var n = parts.length;
    var target = parts[n - 1];
    var count = 0;
    if (n == 1) {
        console.log('0');
        return;
    }
    for (var i = 0; i < n - 1; i++) {
        for (var j = 0; j < n - 1; j++) {
            if ((i + 1) * (j + 1) == target) {
                count++;
            }
        }
    }
    console.log(count);
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
