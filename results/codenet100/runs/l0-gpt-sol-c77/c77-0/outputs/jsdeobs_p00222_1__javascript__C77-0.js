function prime(limit) {
    var sieve = new Array(limit + 1);

    for (var i = 0; i <= limit; i++) {
        sieve[i] = true;
    }

    sieve[0] = false;
    sieve[1] = false;

    var maxFactor = Math.floor(Math.sqrt(limit));

    for (var candidate = 2; candidate <= maxFactor; candidate++) {
        if (!sieve[candidate]) {
            continue;
        }

        for (
            var multiple = candidate * candidate;
            multiple <= limit;
            multiple += candidate
        ) {
            sieve[multiple] = false;
        }
    }

    var primes = [];

    for (var number = 2; number <= limit; number++) {
        if (sieve[number]) {
            primes.push(number);
        }
    }

    return primes;
}

var primes = prime(9999999);
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var values = input.trim().split("\n").map(Number);

for (var i = 0; i < values.length; i++) {
    var limit = values[i];

    if (limit == 0) {
        break;
    }

    var largestQuadrupletEnd = "";

    for (var j = 5; j < primes.length; j++) {
        if (primes[j] > limit) {
            break;
        }

        var first = primes[j] - 8;

        if (
            first === primes[j - 3] &&
            first + 2 === primes[j - 2] &&
            first + 6 === primes[j - 1]
        ) {
            largestQuadrupletEnd = primes[j];
        }
    }

    console.log(largestQuadrupletEnd);
}
