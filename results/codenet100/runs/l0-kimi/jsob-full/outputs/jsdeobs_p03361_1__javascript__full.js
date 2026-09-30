const fs = require('fs');

const main = (input) => {
    const lines = input.split('\n');
    const [rows, cols] = lines[0].split(' ').map(Number);
    const grid = Array(rows).fill(false).map((_, i) => 
        lines[i + 1].slice(0, cols).split('').map(c => c === '#')
    );
    
    const hasPath = grid.some((row, r) => 
        row.some((cell, c) => !cell && 
            (grid[r - 1]?.[c] || grid[r + 1]?.[c] || grid[r][c - 1] || grid[r][c + 1])
        )
    );
    
    console.log(hasPath ? 'Yes' : 'No');
};

main(fs.readFileSync('stdin', 'utf8'));
