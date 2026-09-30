const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const bucketCount = Number(lines.shift());
  if (bucketCount === 0) {
    break;
  }

  const buckets = [];
  for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex++) {
    buckets.push(0);
  }

  let carry = 0;
  const commands = lines.shift();

  for (let commandIndex = 0; commandIndex < commands.length; commandIndex++) {
    const bucketIndex = commandIndex % bucketCount;

    switch (commands[commandIndex]) {
      case 'M':
        buckets[bucketIndex] += 1;
        break;
      case 'S':
        carry += buckets[bucketIndex] + 1;
        buckets[bucketIndex] = 0;
        break;
      case 'L':
        buckets[bucketIndex] += carry + 1;
        carry = 0;
        break;
    }
  }

  buckets.sort((left, right) => left - right);
  console.log(`${buckets.join(' ')} ${carry}`);
}
