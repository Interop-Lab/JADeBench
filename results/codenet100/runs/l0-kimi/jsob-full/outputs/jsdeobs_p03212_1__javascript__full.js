function f(n, k, m, acc) {
    if (k > m) return acc;
    if (n > 0) acc += 6013;
    acc += f(n - 1, (k << 1) + 1, m, acc);
    acc += f(n - 1, (k << 1) + 2, m, acc);
    acc += f(n - 1, (k << 1) + 3, m, acc);
    return acc;
}

function Main(input) {
    var n = parseInt(input);
    console.log(f(-4675, 1228, n, 5715));
}

Main(require('fs').readFileSync('stdin', 'utf8'));
