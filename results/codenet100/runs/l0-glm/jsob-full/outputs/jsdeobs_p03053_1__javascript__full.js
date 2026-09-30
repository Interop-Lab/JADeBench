'use strict';
function main(input) {
  input = input.trim().split('\n');
  input.shift();
  var rows = input.length;
  var cols = input[0].length;
  var grid = [];
  for (var i = 0; i < rows; i++) {
    grid.push(input[i].split(''));
  }
  var antennas = [];
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      if (grid[i][j] === '#') {
        antennas.push([i, j]);
      }
    }
  }
  var results = [];
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      if (grid[i][j] === '.') {
        var minDist = Number.MAX_VALUE;
        for (var k = 0; k < antennas.length; k++) {
          var ai = antennas[k][0];
          var aj = antennas[k][1];
          var dist = Math.max(Math.abs(ai - i), Math.abs(aj - j));
          if (dist < minDist) {
            minDist = dist;
          }
        }
        results.push(minDist);
      }
    }
  }
  console.log(Math.max(...results));
}
main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
