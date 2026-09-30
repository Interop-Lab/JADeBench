const main = (input) => {
  const lines = input.toString().split('\n');
  const n = parseInt(lines[0].split(' ')[0], 10);
  const m = parseInt(lines[0].split(' ')[1], 10);
  const k = parseInt(lines[0].split(' ')[2], 10);
  const target = parseInt(lines[0].split(' ')[3], 10);
  const a = lines[1].split(' ').map(Number).sort((x, y) => y - x).map(x => x - 0);
  const b = lines[2].split(' ').map(Number).sort((x, y) => y - x).map(x => x - 0);
  const c = lines[3].split(' ').map(Number).sort((x, y) => y - x).map(x => x - 0);
  const results = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let l = 0; l < k; l++) {
        if (i * j * l > target) break;
        const sum = a[i] + b[j] + c[l];
        results.push(sum);
      }
    }
  }
  console.log(results.sort((x, y) => y - x).filter(x => x < target).join('\n'));
};

main(require('fs').readFileSync('in', 'utf8'));
