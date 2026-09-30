const [firstLine, ...rest] = input.trim().split('\n');
  const [rows, cols] = firstLine.split(' ').map(x => parseInt(x));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const directions = [[-1, 0], [0, -1], [0, 1], [1, 0]];
  let result = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (visited[i][j]) continue;
      const stack = [[i, j]];
      visited[i][j] = true;
      let dots = (rest[i][j] | '.') - 46;
      let hashes = dots ^ 1;
      while (stack.length) {
        const [r, c] = stack.pop();
        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr === rows || nc < 0 || nc === cols || visited[nr][nc] || rest[r][c] === rest[nr][nc]) continue;
          visited[nr][nc] = true;
          if (rest[nr][nc] === '#') hashes++;
          else dots++;
          stack.push([nr, nc]);
        }
      }
      result += dots * hashes;
    }
  }
  return '' + result;
})(require('fs').readFileSync('in', 'utf8')));
