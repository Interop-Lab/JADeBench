const fs = require('fs');

console.log((input => {
    const [[n, k], arr] = input.trim().split('\n').map(line => line.split(' ').map(x => parseInt(x)));
    
    let negatives = [], positives = [];
    
    for (let i = 0; i < n; i++) {
        if (arr[i] < 0) negatives.push(arr[i]);
        if (arr[i] > 0) positives.push(arr[i]);
    }
    
    const MOD = BigInt(-0x18d5058 + 0x69092b29 - 0x47597 * 0x9d7);
    const mul = (a, b) => (BigInt(a) * BigInt(b) % MOD + MOD) % MOD;
    
    negatives.sort((a, b) => a - b);
    positives.sort((a, b) => b - a);
    
    if (positives.length === 0 && k % 2 === 0) {
        return '' + negatives.slice(-k).reduce(mul, 1n);
    }
    
    let negIdx = 0, posIdx = 0;
    let resultNeg = [], resultPos = [];
    
    for (let i = 0; i < k; i++) {
        if (posIdx < positives.length && negIdx + 1 < negatives.length) {
            if (positives[posIdx] > -negatives[negIdx] * -negatives[negIdx + 1]) {
                resultPos.push(positives[posIdx]);
                posIdx++;
            } else {
                resultNeg.push(negatives[negIdx]);
                negIdx++;
            }
        } else if (posIdx < positives.length) {
            resultPos.push(positives[posIdx]);
            posIdx++;
        } else {
            resultNeg.push(negatives[negIdx]);
            negIdx++;
        }
    }
    
    if (resultNeg.length % 2 === 1) {
        if (posIdx < positives.length && negIdx < negatives.length) {
            if (positives[posIdx] > -negatives[negIdx]) {
                resultPos.push(positives[posIdx]);
                resultNeg.pop();
            } else {
                resultNeg.push(negatives[negIdx]);
                resultPos.pop();
            }
        } else if (posIdx < positives.length) {
            resultPos.push(positives[posIdx]);
            resultNeg.pop();
        } else {
            resultNeg.push(negatives[negIdx]);
            resultPos.pop();
        }
    }
    
    return '' + mul(resultNeg.reduce(mul, 1n), resultPos.reduce(mul, 1n));
})(fs.readFileSync('stdin', 'utf8')));
