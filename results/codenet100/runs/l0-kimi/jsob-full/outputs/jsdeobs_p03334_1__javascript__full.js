function Main(input) {
    input = input.split(' ').map(n => +n);
    var n = input[0];
    var a = calc(input[1]);
    var b = calc(input[2]);
    var results = [];
    var count = 0;
    for (var i = 0; i < n * n; i++) {
        for (var j = 0; j < n * n; j++) {
            if (f(a, i, j) && f(b, i, j)) {
                results[count++] = i + ' ' + j;
            }
            if (count === n * n) {
                console.log(results.join('\n'));
                return;
            }
        }
    }
}

function calc(x) {
    var cnt = 0;
    while ((x & 1) === 0) {
        cnt++;
        x >>>= 1;
    }
    return [cnt, x & 1];
}

function f(arr, a, b) {
    a = Math.floor(a / arr[1]);
    if (!arr[0]) return !(a & 1);
    b = Math.floor(b / arr[1]);
    return !((a + b) & 1);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
