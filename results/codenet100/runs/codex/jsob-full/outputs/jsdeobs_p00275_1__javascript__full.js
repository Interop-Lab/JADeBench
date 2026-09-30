const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
  const counterCount = Number(lines.shift());
  if (counterCount === 0) break;

  const counters = [];
  for (let counterIndex = 0; counterIndex < counterCount; counterIndex++) {
    counters[counterIndex] = 0;
  }
  let carriedValue = 0;
  const commands = lines.shift();

  for (let position = 0; position < commands.length; position++) {
    const command = commands[position];
    const counterIndex = position % counterCount;

    switch (command) {
      case 'M':
        counters[counterIndex]++;
        break;
      case 'S':
        carriedValue += counters[counterIndex] + 1;
        counters[counterIndex] = 0;
        break;
      case 'L':
        counters[counterIndex] += carriedValue + 1;
        carriedValue = 0;
        break;
    }
  }

  counters.sort((left, right) => left - right);
  console.log(counters.join(' ') + ' ' + carriedValue);
}
