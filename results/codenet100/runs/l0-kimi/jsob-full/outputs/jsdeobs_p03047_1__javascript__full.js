function Main(input) {
    var parts = input.split(' ');
    var first = parts[0];
    var second = parts[1];
    var result = parseInt(first) + parseInt(second);
    console.log(result);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
