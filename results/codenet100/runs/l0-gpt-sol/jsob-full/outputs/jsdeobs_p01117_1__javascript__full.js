var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split('\n');

while (true) {
    var [n, m] = arr.shift().split(' ').map(Number);

    if (n == 0 && m == 0) {
        break;
    }

    var totals = [];
    for (var i = 0; i < n; i++) {
        totals[i] = 0;
    }

    for (var i = 0; i < m; i++) {
        var values = arr.shift().split(' ').map(Number);
        totals = values.map((value, index) => totals[index] + value);
    }

    console.log(Math.max(...totals));
}
