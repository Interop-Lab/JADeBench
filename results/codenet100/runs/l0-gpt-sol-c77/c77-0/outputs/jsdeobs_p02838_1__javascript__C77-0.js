function Main(input) {
    var lines = input.split('\n');
    var count = parseInt(lines[0], 10);
    var values = lines[1].split(' ');
    var highParts = new Array(count);

    var lowSum = 0;
    var highSum = 0;
    var modulus = 1000000007;
    var uint32Range = 4294967296;
    var carryThreshold = uint32Range / 2;

    for (var i = 0; i < count; i++) {
        values[i] = parseInt(values[i], 10);
        highParts[i] = Math.floor(values[i] / uint32Range);
        values[i] = values[i] % uint32Range;
    }

    for (var i = 0; i < count - 1; i++) {
        for (var j = i + 1; j < count; j++) {
            lowSum += values[i] ^ values[j];

            if (lowSum > carryThreshold) {
                lowSum %= carryThreshold;
                highSum += 0.5;
            }

            highSum += highParts[i] ^ highParts[j];
        }
    }

    lowSum += highSum * uint32Range;
    console.log(lowSum % modulus);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
