function main(lines) {
  const itemCount = lines[0].split(' ')[0] - 0;
  const range = lines[0].split(' ')[1] - 0;
  const capacity = lines[0].split(' ')[2] - 0;

  let items = [];

  for (let i = 0; i < itemCount; i++) {
    items.push(lines[i].split(' ').map(value => value - 0));
  }

  items = items.sort((a, b) => a[0] - b[0]);

  let result = 0;

  for (let i = 0; i < itemCount; i++) {
    const item = items[i];

    if (item[1] > 0) {
      const amount = Math.ceil(item[1] / capacity);
      result += amount;

      for (let j = i; j < itemCount; j++) {
        const current = items[j];

        if (current[0] <= item[0] + (range - 2)) {
          current[1] -= capacity * amount;
        } else {
          break;
        }
      }
    }
  }

  console.log(result);
}

main(
  require('fs')
    .readFileSync('./input.in', 'utf8')
    .split('\n')
);
