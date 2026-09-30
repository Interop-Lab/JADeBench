function Main(input) {
    input = input.split('\n');
    var target = input[0].split(' ').map(Number);
    var count = 0;
    for (var i = 1; i < input.length; i++) {
        var coords = input[i].split(' ').map(Number);
        if (coords[0] >= target[0] && coords[1] >= target[1]) {
            count++;
        }
    }
    console.log(count);
}

Main(require('fs').readFileSync('stdin', 'utf-8').trim());
