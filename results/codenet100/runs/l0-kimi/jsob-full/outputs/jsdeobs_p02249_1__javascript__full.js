var config = {};
config.encoding = 'utf-8';
config.separator = '\n';
config = config;
var line = require('fs').readFileSync(config.encoding, 'utf-8').split(config.separator);
line[0] = line[0].split(' ').map(Number);
var H = line[0][0];
var W = line[0][1];
var field = line.slice(1, 1 + H);
line[1 + H] = line[1 + H].split(' ').map(Number);
var R = line[1 + H][0];
var C = line[1 + H][1];
var pat = line.slice(1 + H + 1, 1 + H + 1 + R);
var mem = new Array(H);
for (var i = 0; i < H; i++) {
    mem[i] = new Array(R);
    for (var j = 0; j < R; j++) {
        mem[i][j] = {};
        var k = field[i].indexOf(pat[j]);
        while (k !== -1) {
            mem[i][j][k] = true;
            k = field[i].indexOf(pat[j], k + 1);
        }
    }
}
for (var i = 0; i <= H - R; i++) {
    for (var j = 0; j <= W - C; j++) {
        var flag = true;
        for (var k = 0; k < R; k++) {
            if (!mem[i + k][k].hasOwnProperty(j)) {
                flag = false;
                break;
            }
        }
        if (flag) console.log('Yes', i, j);
    }
}
