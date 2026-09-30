const input = require('fs').readFileSync('/dev/stdin', 'utf8');

function Main(input) {
  input = input.split('\n');
  const N = +input[0];
  if (N === 1) {
    console.log(0);
    return;
  }
  const points = input.slice(1).map(line => line.split(' ').map(x => +x));
  const counts = {};
  points.forEach(p1 => {
    points.forEach(p2 => {
      if (p1 === p2) return;
      const key = [p2[0] - p1[0], p2[1] - p1[1]].join('_');
      counts[key] = counts[key] == null ? 1 : counts[key] + 1;
    });
  });
  const result = Object.keys(counts).reduce((acc, key) => {
    const count = counts[key];
    return count > acc[0] ? [count, key] : [acc[0], acc[1]];
  }, [0, '']);
  console.log(N - (result[0] + 1));
}

Main(input);
