'use strict';

function main(input) {
  input = input.trim().split('\n');
  input.shift();
  var H = input.length;
  var W = input[0].length;
  var grid = [];
  for (var i = 0; i < H; i++) {
    grid.push(input[i].split(''));
  }

  var dots = [];
  for (var i = 0; i < H; i++) {
    for (var j = 0; j < W; j++) {
      if (grid[i][j] === '#') {
        dots.push([i, j]);
      }
    }
  }

  var result = [];
  for (var i = 0; i < H; i++) {
    for (var j = 0; j < W; j++) {
      if (grid[i][j] === '.') {
        var minDist = Number.MAX_SAFE_INTEGER;
        for (var k = 0; k < dots.length; k++) {
          var di = dots[k][0];
          var dj = dots[k][1];
          var dist = Math.abs(di - i) + Math.abs(dj - j);
          if (dist < minDist) {
            minDist = dist;
          }
        }
        result.push(minDist);
      }
    }
  }
  console.log(Math.max(...result));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
