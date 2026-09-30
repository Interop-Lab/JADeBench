function Main(input) {
    var lines = input.split('\n');
    var conditions = lines[0].split(' ').map(Number);
    var count = 0;

    for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(' ').map(Number);

        if (values[0] >= conditions[1] && values[1] >= conditions[2]) {
            count++;
        }
    }

    console.log(count);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
