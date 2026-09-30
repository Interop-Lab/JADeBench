function Main(input) {
    input = input.split('\n');
    input = input[0];
    var result = '';
    for (var i = 0; i <= input.length; i = i + 3) {
        result += input[i + 1];
    }
    console.log(result);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
