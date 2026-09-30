const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const result = (input => {
  const [firstLine, ...restLines] = input.trim().split('\n');
  const [rows, cols] = firstLine.split(' ').map(s => parseInt(s));

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const directions = [[-1, 0], [0, -1], [0, 1], [1, 0]];

  let total = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r][c]) continue;

      const stack = [[r, c]];
      visited[r][c] = true;

      let area = 0;
      let perimeter = 0;

      while (stack.length) {
        const [cr, cc] = stack.pop();

        for (const [dr, dc] of directions) {
          const nr = cr + dr;
          const nc = cc + dc;

          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || visited[nr][nc] || restLines[cr][cc] !== restLines[nr][nc]) continue;

          visited[nr][nc] = true;

          if (restLines[nr][nc] === '#') perimeter++;
          else area++;

          stack.push([nr, nc]);
        }
      }

      total += area * perimeter;
    }
  }

  return '' + total;
})(input);

console.log(result);
