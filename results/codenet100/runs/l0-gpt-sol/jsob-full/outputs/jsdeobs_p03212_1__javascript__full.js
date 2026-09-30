function f(mask, value, limit, count) {
    if (value > limit) {
        return count;
    }

    if (mask === 7) {
        count += 1;
    }

    count += f(mask | 1, value * 10 + 3, limit, 0);
    count += f(mask | 2, value * 10 + 5, limit, 0);
    count += f(mask | 4, value * 10 + 7, limit, 0);

    return count;
}

function Main(input) {
    var limit = parseInt(input);
    console.log(f(0, 0, limit, 0));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
