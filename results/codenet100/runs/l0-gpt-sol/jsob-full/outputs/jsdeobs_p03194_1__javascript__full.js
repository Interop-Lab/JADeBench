function Main(input) {
    const values = input.split(' ');
    const minimumExponent = parseInt(values[0], 10);
    let number = parseInt(values[1], 10);

    const primeFactors = [];
    let divisor = 2;

    while (divisor <= number) {
        while (number % divisor === 0) {
            primeFactors.push(divisor);
            number = Math.floor(number / divisor);
        }
        divisor++;
    }

    const factorCounts = [];
    for (let i = 0; i < primeFactors.length; i++) {
        const factor = primeFactors[i];
        factorCounts[factor] = factorCounts[factor]
            ? factorCounts[factor] + 1
            : 1;
    }

    const uniqueFactors = primeFactors.filter(function (factor, index, factors) {
        return factors.indexOf(factor) === index;
    });

    let result = 1;
    for (let i = 0; i < uniqueFactors.length; i++) {
        const factor = uniqueFactors[i];
        if (factorCounts[factor] >= minimumExponent) {
            result *= factor;
        }
    }

    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
