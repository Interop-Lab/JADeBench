var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var numbers = input.trim().split('\n').map(Number);
numbers.shift();
numbers.sort(function (a, b) {
    return a - b;
});

var max = numbers[numbers.length - 1];
var primes = [2];

for (var candidate = 3; candidate <= max; candidate += 2) {
    var isPrime = true;
    var limit = ~~Math.sqrt(candidate) + 1;

    for (var j = 0; j < primes.length; j++) {
        if (primes[j] > limit) {
            break;
        }

        if (candidate % primes[j] === 0) {
            isPrime = false;
            break;
        }
    }

    if (isPrime) {
        primes.push(candidate);
    }
}

var count = 0;
var searchStart = 0;

for (var i = 0; i < numbers.length; i++) {
    if (numbers[i] !== 2 && numbers[i] % 2 === 0) {
        continue;
    }

    var primeIndex = primes.indexOf(numbers[i], searchStart);
    if (primeIndex !== -1) {
        searchStart = primeIndex;
        count++;
    }
}

console.log(count);
