function main(input) {
  var lines = input.trim().split('\n');
  var n = parseInt(lines[0].split(' ')[0], 10);
  var m = parseInt(lines[0].split(' ')[1], 10);
  var k = parseInt(lines[0].split(' ')[2], 10);
  var intervals = [];
  for (var i = 1; i <= n; i++) {
    intervals.push(lines[i].split(' ').map(x => x - 0));
  }
  intervals = intervals.sort((a, b) => a[0] - b[0]);
  var result = 0;
  for (var i = 1; i <= n; i++) {
    var interval = intervals[i - 1];
    if (interval[1] > 0) {
      var take = Math.min(interval[1], k);
      result += take;
      for (var j = i; j <= n; j++) {
        var next = intervals[j - 1];
        if (next[0] <= interval[0] + (m - 1)) {
          next[1] -= k - take;
        } else {
          break;
        }
      }
    }
  }
  console.log(result);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
