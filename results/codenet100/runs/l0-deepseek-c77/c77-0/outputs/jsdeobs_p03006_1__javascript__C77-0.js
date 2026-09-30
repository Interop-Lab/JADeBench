function Main(input) {
  const lines = input.split('\n');
  const n = +lines[0];
  if (n === 2) {
    console.log(1);
    return;
  }
  const points = lines.slice(1).map(line => line.split(' ').map(Number));
  const diffs = {};
  points.forEach(p => {
    points.forEach(q => {
      if (p === q) return;
      const key = [q[0] - p[0], q[1] - p[1]].join('_');
      diffs[key] = diffs[key] == null ? 1 : diffs[key] + 1;
    });
  });
  const best = Object.keys(diffs).reduce(
    (acc, key) => {
      const count = diffs[key];
      return count > acc[0] ? [count, key] : [acc[0], acc[1]];
    },
    [0, '']
  );
  console.log(1 + (n - 1) - best[0]);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
