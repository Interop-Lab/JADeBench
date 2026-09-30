const input = require('fs').readFileSync('/dev/stdin', 'utf8');
Main(input);

function Main(input) {
  input = input.trim().split('\n');
  const N = parseInt(input[0]);
  const S = input[1];
  let count = 0;
  if (N < 3) {
    console.log('0');
    return;
  }
  for (let i = 0; i < N - 2; i++) {
    for (let j = i + 1; j < N - 1; j++) {
      if (S[i] !== S[j] && S[i] !== S[j + 1] && S[j] !== S[j + 1]) {
        count++;
      }
    }
  }
  console.log(count);
}
