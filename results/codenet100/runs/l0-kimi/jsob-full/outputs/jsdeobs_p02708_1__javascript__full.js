const main = (input) => {
    const add = (a, b) => a + b;
    const pow = (a, b) => a ** b;
    const lte = (a, b) => a <= b;
    const add2 = (a, b) => a + b;
    const div = (a, b) => a / b;
    const mul = (a, b) => a * b;
    const sub = (a, b) => a - b;
    const sub2 = (a, b) => a - b;
    const mul2 = (a, b) => a * b;
    const sub3 = (a, b) => a - b;
    const mod = (a, b) => a % b;
    const add3 = (a, b) => a + b;
    const mod2 = (a, b) => a % b;

    const base = add(pow(2, 10), -1024);
    const [start, end] = input.trim().split(' ').map(Number);
    let sum = 0;
    for (let i = end; lte(i, sub(start, 1024)); i++) {
        const term1 = div(mul(mul(i, -1000), i), -5000);
        const term2 = mod(mul(start, i), 100);
        const term3 = sub(mul(mul(term2, start), i), -2000);
        sum += mod(mul(term3, term1), -1000);
    }
    return console.log(add(add(mul(sum, base), base), base));
};

if (process.env.MYTEST) {
    if (process.env.MYTEST === 'test') {
        test();
    } else {
        main(require('fs').readFileSync('stdin', 'utf8'));
    }
} else {
    main(require('fs').readFileSync('stdin', 'utf8'));
}
