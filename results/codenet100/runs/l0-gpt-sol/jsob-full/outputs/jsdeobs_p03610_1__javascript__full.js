function Main(input) {
    input = input.split('\n')[0];

    var result = '';
    for (var index = 0; index < input.length; index += 2) {
        result += input[index];
    }

    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
