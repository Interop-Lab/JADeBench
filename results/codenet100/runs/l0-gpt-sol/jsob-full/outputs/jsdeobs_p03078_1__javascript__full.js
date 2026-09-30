const main = input => {
  const lines = input.trim().split('\n');
  const [x, y, z, limit] = lines[0].split(' ');

  const a = lines[1]
    .split(' ')
    .sort((left, right) => right - left)
    .map(value => value - 0);

  const b = lines[2]
    .split(' ')
    .sort((left, right) => right - left)
    .map(value => value - 0);

  const c = lines[3]
    .split(' ')
    .sort((left, right) => right - left)
    .map(value => value - 0);

  const sums = [];

  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      for (let k = 0; k < z; k++) {
        if (i * j * k > limit) {
          break;
        }

        sums.push(a[i] + b[j] + c[k]);
      }
    }
  }

  console.log(
    sums
      .sort((left, right) => right - left)
      .filter((value, index) => index < limit)
      .join('\n')
  );
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
