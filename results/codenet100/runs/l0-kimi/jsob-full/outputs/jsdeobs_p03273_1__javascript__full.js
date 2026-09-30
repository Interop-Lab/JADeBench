function main(input) {
    input = input.split(/\s/);
    let rows = parseInt(input[0]);
    let cols = parseInt(input[1]);
    let grid = [];
    for (let i = 2; i < 2 + rows; i++) {
        grid.push(input[i]);
    }
    function countAdjacentHashes(r, c) {
        let count = 0;
        for (let i = 0; i < rows; i++) {
            if (grid[i][r] === '#') {
                count++;
                break;
            }
        }
        for (let j = 0; j < cols; j++) {
            if (grid[c][j] === '#') {
                count++;
                break;
            }
        }
        return count === 2;
    }
    for (let r = 0; r < rows; r++) {
        let ans = '';
        for (let c = 0; c < cols; c++) {
            if (countAdjacentHashes(c, r)) {
                ans += grid[r][c];
            }
        }
        if (ans !== '') {
            console.log(ans);
        }
    }
}
main(require('fs').readFileSync('stdin', 'utf8'));
