function generatePrimes(limit) {
    var sieve = [];

    for (var i = 0; i <= limit; i++) {
        sieve[i] = i;
    }

    sieve[0] = false;
    sieve[1] = false;

    var squareRoot = Math.floor(Math.sqrt(limit));

    for (var i = 2; i <= squareRoot; i++) {
        if (sieve[i] == false) {
            continue;
        }

        for (var multiple = i + i; multiple <= limit; multiple += i) {
            sieve[multiple] = false;
        }
    }

    var primes = [];

    for (var i = 0; i <= limit; i++) {
        if (sieve[i] !== false) {
            primes.push(sieve[i]);
        }
    }

    return primes;
}

var PRIME = generatePrimes(100000);
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var lines = input.trim().split("\n");

lines.forEach(function (line) {
    if (line == "0 0 0") {
        return true;
    }

    var values = line.split(" ").map(Number);
    var maximumProduct = values[0];
    var minimumRatioNumerator = values[1];
    var minimumRatioDenominator = values[2];
    var answer = [0, 0, 0];

    for (var i = 0; i < PRIME.length; i++) {
        for (var j = i; j < PRIME.length; j++) {
            var product = PRIME[i] * PRIME[j];

            if (product > maximumProduct) {
                break;
            }

            if (
                PRIME[j] * minimumRatioNumerator <=
                    PRIME[i] * minimumRatioDenominator &&
                answer[2] < product
            ) {
                answer = [PRIME[i], PRIME[j], product];
            }
        }
    }

    console.log(answer[0] + " " + answer[1]);
});
