const main = (input) => {
  input = input.trim().split('\n');
  const n = parseInt(input[0]);
  const counts = [];
  for (let i = 0; i < 10; i++) {
    counts.push(new Array(10).fill(0));
  }
  for (let i = 1; i <= n; i++) {
    const s = String(i);
    const first = parseInt(s[0]);
    const last = parseInt(s[s.length - 1]);
    counts[first][last]++;
  }
  let result = 0;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      result += counts[i][j] * counts[j][i];
    }
  }
  console.log(result);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
