function prime(limit) {
    var sieve = [];

    for (var i = 0; i <= limit; i++) {
        sieve[i] = i;
    }

    sieve[0] = false;
    sieve[1] = false;

    var squareRoot = Math.floor(Math.sqrt(limit));

    for (var candidate = 2; candidate <= squareRoot; candidate++) {
        if (sieve[candidate] === false) {
            continue;
        }

        for (
            var multiple = candidate + candidate;
            multiple <= limit;
            multiple += candidate
        ) {
            sieve[multiple] = false;
        }
    }

    var primes = [];

    for (var number = 0; number <= limit; number++) {
        if (sieve[number] !== false) {
            primes.push(sieve[number]);
        }
    }

    return primes;
}

var PRIME = prime(100000);
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var lines = input.trim().split("\n");

lines.some(function (line) {
    if (line == "0 0 0") {
        return true;
    }

    var values = line.split(" ").map(Number);
    var maximumProduct = values[0];
    var ratioLeft = values[1];
    var ratioRight = values[2];
    var best = [0, 0, 0];

    for (var leftIndex = 0; leftIndex < PRIME.length; leftIndex++) {
        for (
            var rightIndex = leftIndex;
            rightIndex < PRIME.length;
            rightIndex++
        ) {
            var product = PRIME[leftIndex] * PRIME[rightIndex];

            if (product > maximumProduct) {
                break;
            }

            if (
                PRIME[rightIndex] * ratioLeft <=
                    PRIME[leftIndex] * ratioRight &&
                best[2] < product
            ) {
                best = [PRIME[leftIndex], PRIME[rightIndex], product];
            }
        }
    }

    console.log(best[0] + " " + best[1]);
});
