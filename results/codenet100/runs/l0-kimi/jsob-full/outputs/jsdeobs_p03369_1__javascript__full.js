function main(input) {
    var count = 0;
    for (var i = 0; i < input.length; i++) {
        if (input[i] === 'o') {
            count++;
        }
    }
    console.log(100 + count * 10);
}

main(require('fs').readFileSync('stdin', 'utf8'));
