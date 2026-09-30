const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0]);
  const a = lines[1].split(' ').map(x => parseInt(x));

  let xor = 0;
  for (let i = 0; i < n; i++) {
    xor = a[i] ^ xor;
  }

  let current = xor;
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(current);
    current = a[i] ^ current;
  }

  console.log(result.join(' '));
};

main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
