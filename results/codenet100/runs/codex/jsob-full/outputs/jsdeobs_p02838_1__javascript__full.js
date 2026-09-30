const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const count = parseInt(lines[0], 10);
  const lowParts = lines[1].split(' ');
  const highParts = new Array(count);

  for (let index = 0; index < count; index++) {
    lowParts[index] = parseInt(lowParts[index], 10);
    highParts[index] = Math.floor(lowParts[index] / 4294967296);
    lowParts[index] %= 4294967296;
  }

  let lowSum = 0;
  let highSum = 0;

  for (let left = 0; left < count - 1; left++) {
    for (let right = left + 1; right < count; right++) {
      lowSum += lowParts[left] ^ lowParts[right];

      if (lowSum > 2147483648) {
        lowSum %= 2147483648;
        highSum += 0.5;
      }

      highSum += highParts[left] ^ highParts[right];
    }
  }

  lowSum += highSum * 4294967296;
  console.log(lowSum % 1000000007);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
