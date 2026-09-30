const fs = require('fs');

const input = fs.readFileSync('input.txt', 'utf8');

const result = (() => {
    const [firstLine, ...gridLines] = input.trim().split('\n');
    const [rows, cols] = firstLine.split(' ').map(n => parseInt(n));
    
    const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    let totalScore = 0;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j]) continue;
            
            const stack = [[i, j]];
            grid[i][j] = true;
            
            let openCount = gridLines[i][j] === '.' ? 1 : 0;
            let treeCount = gridLines[i][j] === '#' ? 1 : 0;
            
            while (stack.length) {
                const [r, c] = stack.pop();
                
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                    if (grid[nr][nc]) continue;
                    if (gridLines[r][c] !== gridLines[nr][nc]) continue;
                    
                    grid[nr][nc] = true;
                    
                    if (gridLines[nr][nc] === '#') {
                        treeCount++;
                    } else {
                        openCount++;
                    }
                    
                    stack.push([nr, nc]);
                }
            }
            
            totalScore += openCount * treeCount;
        }
    }
    
    return '' + totalScore;
})();

console.log(result);
