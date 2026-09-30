function equal(first, second) {
    const firstKeys = Object.getOwnPropertyNames(first);
    const secondKeys = Object.getOwnPropertyNames(second);

    if (firstKeys.length !== secondKeys.length) {
        return false;
    }

    for (const key of firstKeys) {
        if (first[key] !== second[key]) {
            return false;
        }
    }

    return true;
}

function pi(value) {
    return parseInt(value, 10);
}

const powersOfSix = [6, 5, 4, 3, 2, 1].map(exponent =>
    Math.pow(6, exponent)
);

const powersOfNine = [5, 4, 3, 2, 1].map(exponent =>
    Math.pow(9, exponent)
);

function count(value) {
    if (value < 6) {
        return value;
    }

    if (value < 9) {
        return value - 5;
    }

    const largestPowerOfSix = powersOfSix.find(power => power <= value);
    const largestPowerOfNine = powersOfNine.find(power => power <= value);

    return Math.min(
        count(value - largestPowerOfSix) + 1,
        count(value - largestPowerOfNine) + 1
    );
}

function main(input) {
    const value = pi(input);
    console.log(count(value));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
