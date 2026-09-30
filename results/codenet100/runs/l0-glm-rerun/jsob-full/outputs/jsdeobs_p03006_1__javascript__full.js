const input = require('fs').readFileSync('/dev/stdin', 'utf8');

function Main(input) {
  input = input.split('\n');
  const N = +input[0];
  if (N === 1) {
    console.log(0);
    return;
  }
  const towns = input.slice(1).map(line => line.split(' ').map(x => +x));
  const counts = {};
  towns.forEach(a => {
    towns.forEach(b => {
      if (a === b) return;
      const key = [b[0] - a[0], b[1] - a[1]].join('_');
      counts[key] = counts[key] == null ? 1 : counts[key] + 1;
    });
  });
  const result = Object.keys(counts).reduce((acc, key) => {
    const count = counts[key];
    return count > acc[0] ? [count, key] : [acc[0], acc[1]];
  }, [0, '']);
  console.log(N - result[0]);
}

Main(input);
