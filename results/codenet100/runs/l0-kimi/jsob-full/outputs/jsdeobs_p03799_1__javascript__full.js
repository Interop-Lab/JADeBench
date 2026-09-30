function Main(input) {
    var parts = input.split(' ');
    var a = Number(parts[0]);
    var b = Number(parts[1]);
    var result = 0;
    if (b > a / 2) {
        result += Math.floor(a / 2);
    } else {
        result += b;
        a -= result * 2;
        result += Math.floor(a / 2);
    }
    console.log(result);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
