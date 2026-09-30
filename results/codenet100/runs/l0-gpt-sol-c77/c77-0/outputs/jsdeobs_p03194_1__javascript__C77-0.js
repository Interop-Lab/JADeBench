function Main(input) {
    var values = input.split(' ');
    var requiredExponent = parseInt(values[0], 10);
    var number = parseInt(values[1], 10);

    var primeFactors = [];
    var factorCounts = [];
    var result = 1;
    var divisor = 2;

    while (divisor <= number) {
        while (number % divisor === 0) {
            primeFactors.push(divisor);
            number = Math.floor(number / divisor);
        }
        divisor++;
    }

    for (var i = 0; i < primeFactors.length; i++) {
        var factor = primeFactors[i];
        factorCounts[factor] = factorCounts[factor]
            ? factorCounts[factor] + 1
            : 1;
    }

    var uniqueFactors = primeFactors.filter(function (factor, index, factors) {
        return factors.indexOf(factor) === index;
    });

    for (var i = 0; i < uniqueFactors.length; i++) {
        var factor = uniqueFactors[i];
        if (factorCounts[factor] >= requiredExponent) {
            result *= factor;
        }
    }

    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
