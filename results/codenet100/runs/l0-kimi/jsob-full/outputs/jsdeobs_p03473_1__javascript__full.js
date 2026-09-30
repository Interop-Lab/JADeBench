function Main(input) {
    input = input.trim();
    console.log(100 + (50 - input));
}

Main(require('fs').readFileSync('stdin', 'utf8'));
