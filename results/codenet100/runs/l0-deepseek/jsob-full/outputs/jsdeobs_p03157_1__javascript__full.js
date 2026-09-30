const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');

const lines = input.trim().split('\n');
const [rows, cols] = lines[0].split(' ').map(Number);
const grid = lines.slice(1).map(line => line.split(''));

const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];

let totalPrice = 0;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (visited[r][c]) continue;

    const queue = [[r, c]];
    visited[r][c] = true;
    let area = 0;
    let perimeter = 0;

    while (queue.length > 0) {
      const [cr, cc] = queue.shift();
      area++;

      for (const [dr, dc] of directions) {
        const nr = cr + dr;
        const nc = cc + dc;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] !== grid[cr][cc]) {
          perimeter++;
        } else if (!visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }

    totalPrice += area * perimeter;
  }
}

console.log(totalPrice);
