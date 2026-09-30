function Main(input) {
    console.log(
        (input || '')
            .split(/\s+/)
            .map(function (word) {
                return word[0].toUpperCase();
            })
            .join('')
    );
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
