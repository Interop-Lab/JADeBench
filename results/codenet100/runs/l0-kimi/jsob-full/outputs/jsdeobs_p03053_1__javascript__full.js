'use strict';
const fs = require('fs');

function main(input) {
    const lines = input.trim().split('\n');
    lines.shift();
    
    const height = lines.length;
    const width = lines[0].length;
    const grid = [];
    
    for (let i = 0; i < lines.length; i++) {
        grid.push(lines[i].split(''));
    }
    
    const galaxies = [];
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (grid[r][c] === '#') {
                galaxies.push([r, c]);
            }
        }
    }
    
    const expansions = [];
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (grid[r][c] === '.') {
                let minDist = Number.MAX_SAFE_INTEGER;
                for (let i = 0; i < galaxies.length; i++) {
                    const gr = galaxies[i][0];
                    const gc = galaxies[i][1];
                    const dist = Math.abs(gr - r) + Math.abs(gc - c);
                    if (dist < minDist) {
                        minDist = dist;
                    }
                }
                expansions.push(minDist);
            }
        }
    }
    
    console.log(Math.max(...expansions));
}

main(fs.readFileSync('in', 'utf8'));
