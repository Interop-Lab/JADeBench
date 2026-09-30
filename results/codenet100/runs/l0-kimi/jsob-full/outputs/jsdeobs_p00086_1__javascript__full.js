var input = require('fs').readFileSync('stdin', 'utf8').trim();
var lines = input.split('\n');
while (lines.length > 0) {
    var path = [];
    var line;
    while ((line = lines.shift()) != null) {
        var nums = line.split(' ');
        var from = +nums[0];
        var to = +nums[1];
        path[from] = (path[from] || 0) + 1;
        path[to] = (path[to] || 0) + 1;
    }
    var odds = path.filter(function (value) {
        return value % 2 === 1;
    });
    if (path[0] % 2 === 0 && path[path.length - 1] % 2 === 0 && odds.length > 0)
        console.log('NG');
    else
        console.log('OK');
}
