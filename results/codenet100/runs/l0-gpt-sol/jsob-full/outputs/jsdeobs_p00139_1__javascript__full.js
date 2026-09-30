var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.replace(/\n$/, '').split('\n');
var n = lines.shift();

for (var i = 0; i < n; i++) {
    if (/^>'(=+)#\1~$/.test(lines[i])) {
        console.log('A');
    } else if (/^>\^(Q=)+~~$/.test(lines[i])) {
        console.log('B');
    } else {
        console.log('NA');
    }
}
