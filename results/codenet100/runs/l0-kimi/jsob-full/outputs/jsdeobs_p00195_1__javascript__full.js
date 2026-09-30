var input = require('fs').readFileSync('stdin', 'utf8');
var Arr = input.toString().trim().split('\n');
var abc = [];

for (var i = 0; i < Arr.length; i++) {
    if (abc.length == 0 && Arr[i] == '0') break;
    if (abc.length == 0) {
        var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var max = abc.reduce(function(a, b) {
            return Math.max(a, b);
        });
        var str = ABC[abc.indexOf(max)];
        console.log(str + ' ' + max);
        abc = [];
    } else {
        var arr = Arr[i].split(' ').map(Number);
        abc.push(arr[0] + arr[1]);
    }
}
