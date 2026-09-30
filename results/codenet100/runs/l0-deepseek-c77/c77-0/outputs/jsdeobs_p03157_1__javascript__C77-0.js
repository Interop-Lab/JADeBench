const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');

const lines = input.trim().split('\n');
const [rows, cols] = lines[0].split(' ').map(Number);
const grid = lines.slice(1);

const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
const directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

let totalPrice = 0;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (visited[r][c]) continue;

    const stack = [[r, c]];
    visited[r][c] = true;
    let area = grid[r][c] === '.' ? 0 : 1;
    let perimeter = grid[r][c] === '.' ? 0 : 1;

    while (stack.length) {
      const [cr, cc] = stack.pop();

      for (const [dr, dc] of directions) {
        const nr = cr + dr;
        const nc = cc + dc;

        if (nr < 0 || rows <= nr || nc < 0 || cols <= nc || visited[nr][nc] || grid[cr][cc] === grid[nr][nc]) {
          continue;
        }

        visited[nr][nc] = true;
        if (grid[nr][nc] === '#') perimeter++;
        else area++;
        stack.push([nr, nc]);
      }
    }

    totalPrice += area * perimeter;
  }
}

console.log(String(totalPrice));
