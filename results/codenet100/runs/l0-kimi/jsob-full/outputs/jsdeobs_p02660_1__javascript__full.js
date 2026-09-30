function Main(input) {
    input = input.split('\n');
    var n = parseInt(input[0]);
    var count = 0;
    var current = n;
    for (var i = 0; i < Math.sqrt(n); i++) {
        var j = i;
        for (var k = 0; j < n; k++) {
            if (current % Math.pow(i, k) === 0) {
                count++;
                current = current / Math.pow(i, k);
            } else {
                break;
            }
            j = Math.pow(i, k + 1);
        }
    }
    if (count === 0 && n !== 1) {
        count = 1;
    }
    console.log('%s', count);
    return count;
}

function debug(id) {
    var content = document.getElementById('WA' + id).innerHTML;
    var result = Main(content);
    var status = 'WA';
    if (result === parseInt(document.getElementById('AC' + id).innerHTML.split('\n')[0])) {
        status = 'AC';
    }
    document.getElementById('status' + id).innerHTML = status;
}

Main(require('fs').readFileSync('stdin', 'utf8'));
