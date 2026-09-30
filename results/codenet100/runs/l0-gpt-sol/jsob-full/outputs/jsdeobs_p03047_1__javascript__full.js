function Main(input) {
    var values = input.trim().split(' ');
    var first = values[0];
    var second = values[1];
    var result = first - second + 1;
    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
