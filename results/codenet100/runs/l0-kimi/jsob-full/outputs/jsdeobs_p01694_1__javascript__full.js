var input = require('fs').readFileSync('stdin', 'utf8');
var arr = input.trim().split('\n');

while (true) {
    var n = arr.shift() - 1;
    if (n == -1) break;
    var ary = arr.shift().split(' ');
    var L = 0, R = 0, UD = 0, cnt = 0;
    
    ary.forEach(function(cmd) {
        if (cmd == 'lu') L = 1;
        else if (cmd == 'ru') R = 1;
        else if (cmd == 'ld') L = -1;
        else if (cmd == 'rd') R = -1;
        
        if (UD != L + R) {
            cnt++;
            UD = UD == 1 ? -1 : 1;
        }
    });
    
    console.log(cnt);
}
