var input = require('fs').readFileSync('stdin', 'utf8');
var Arr = input.replace(/\n$/, '').split('\n');
while (true) {
    var arr = Arr.shift().split(' ').map(Number);
    if (arr.join('') == '000') break;
    var y = Arr.shift().split(' ').map(Number);
    (function (arr, y) {
        var x = 0;
        while (true) {
            if (y[0] == x) y.shift();
            if (y[0] == 0) {
                console.log(x);
                break;
            }
            x = (x + arr[0] + arr[1]) % arr[2];
            if (x == 0) {
                console.log(-1);
                break;
            }
        }
    })(arr, y);
}
