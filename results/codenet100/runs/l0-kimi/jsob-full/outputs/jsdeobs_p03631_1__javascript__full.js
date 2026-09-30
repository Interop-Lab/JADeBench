function Main(input) {
    var str = String(input);
    if (str[0] == str[str.length - 1]) {
        console.log('@f^1');
    } else {
        console.log('No');
    }
}
Main(require('fs').readFileSync('stdin', 'utf-8'));
