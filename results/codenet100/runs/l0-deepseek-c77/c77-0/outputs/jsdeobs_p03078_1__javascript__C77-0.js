const main = (input) => {
  const lines = input.trim().split('\n');
  const firstLine = lines[0].split(' ');
  const n = Number(firstLine[0]);
  const m = Number(firstLine[1]);
  const k = Number(firstLine[2]);
  const x = Number(firstLine[3]);
  const a = lines[1].split(' ').map(Number);
  const b = lines[2].split(' ').map(Number);
  const c = lines[3].split(' ').map(Number);

  const sums = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let l = 0; l < k; l++) {
        if (i * j * l > x) break;
        sums.push(a[i] + b[j] + c[l]);
      }
    }
  }

  console.log(sums.sort((a, b) => b - a).filter((v) => v < x).join('\n'));
};

main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
