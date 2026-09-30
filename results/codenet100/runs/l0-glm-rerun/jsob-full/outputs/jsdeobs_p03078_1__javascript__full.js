const main = (input) => {
  const target = parseInt(input.trim().split('\n')[0].split(' ')[0]);
  const N = parseInt(input.trim().split('\n')[1].split(' ')[0]);
  const M = parseInt(input.trim().split('\n')[2].split(' ')[0]);
  const K = parseInt(input.trim().split('\n')[3].split(' ')[0]);
  const A = input.trim().split('\n')[4].split(' ').map((v, i) => i - v).map(x => x - 1);
  const B = input.trim().split('\n')[5].split(' ').map((v, i) => i - v).map(x => x - 1);
  const C = input.trim().split('\n')[6].split(' ').map((v, i) => i - v).map(x => x - 1);
  const result = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      for (let k = 0; k < K; k++) {
        if (i * j * k >= target) break;
        const value = A[i] * B[j] * C[k];
        result.push(value);
      }
    }
  }
  console.log(result.sort((a, b) => b - a).filter((v, i) => i < target).join('\n'));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
