const main = input => {
  const lines = input.split('\n');
  const [H, W] = lines[0].split(' ').map(Number);
  const grid = Array.from({ length: H }, (_, i) =>
    lines[i + 1].split('').slice(0, W).map(c => c === '#')
  );
  const result = grid.reduce((acc, _, i) =>
    acc.every((v, j) =>
      !v ||
      (grid[i - 1] || [])[j] ||
      (grid[i + 1] || [])[j] ||
      grid[i][j - 1] ||
      grid[i][j + 1]
    )
  );
  console.log(result ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
