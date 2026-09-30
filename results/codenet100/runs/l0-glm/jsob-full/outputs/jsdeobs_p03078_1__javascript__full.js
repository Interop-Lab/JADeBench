const main = input => {
  const lines = input.trim().split('\n');
  const target = parseInt(lines[0].split(' ')[0]);
  const N = parseInt(lines[1].split(' ')[0]);
  const M = parseInt(lines[2].split(' ')[0]);
  const K = parseInt(lines[3].split(' ')[0]);
  const A = lines[4].split(' ').map(Number).map(x => x - 1);
  const B = lines[5].split(' ').map(Number).map(x => x - 1);
  const C = lines[6].split(' ').map(Number).map(x => x - 1);
  const results = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      for (let k = 0; k < K; k++) {
        if (i * j * k > target) break;
        results.push(A[i] + B[j] + C[k]);
      }
    }
  }
  console.log(results.sort((a, b) => a - b).filter(x => x < target).join('\n'));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
