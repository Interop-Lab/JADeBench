function Main(input) {
  const lines = input.trim().split('\n');
  const first = lines[0].split(' ').map(Number);
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(' ').map(Number);
    if (parts[0] >= first[1] && parts[1] >= first[2]) {
      count++;
    }
  }
  console.log(count);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
