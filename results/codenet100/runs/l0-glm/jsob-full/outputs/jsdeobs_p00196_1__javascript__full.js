var input = require('fs')['readFileSync']('/dev/stdin', 'utf8');
var Arr = input['trim']()['split']('\n');
while (true) {
    var n = Arr['shift']() - 0;
    if (n == 0) break;
    var team = [];
    for (var i = 0; i < n; i++) {
        var arr = Arr['shift']()['trim']()['split'](' ');
        var name = arr['shift']();
        var scoreA = 0;
        var scoreB = 0;
        for (var j = 0; j < n - 1; j++) {
            if (arr[j] - 0 === 0) scoreA++;
            if (arr[j] - 0 === 1) scoreB++;
        }
        team['push']([name, scoreA * 3 + (n - 1 - j - scoreB) + (j - 0 + 0.01)]);
    }
    team['sort'](function (a, b) {
        return b[0] - a[0];
    });
    team['forEach'](function (x) {
        console['log'](x[1]);
    });
}
