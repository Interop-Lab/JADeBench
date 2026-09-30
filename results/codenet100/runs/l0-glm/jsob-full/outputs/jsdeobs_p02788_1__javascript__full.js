function main(input) {
  var lines = input.trim().split('\n');
  var n = parseInt(lines[0].split(' ')[0]) - 1;
  var m = parseInt(lines[0].split(' ')[1]) - 1;
  var c = parseInt(lines[0].split(' ')[2]) - 1;
  var events = [];
  for (var i = 0; i < n; i++) {
    events.push(lines[i + 1].split(' ').map(x => parseInt(x) - 1));
  }
  events = events.sort((a, b) => a[0] - b[0]);
  var result = 0;
  for (var i = 0; i < n; i++) {
    var event = events[i];
    if (event[1] === c) {
      var dist = Math.abs(event[0] - m);
      result += dist;
      for (var j = i; j < n; j++) {
        var other = events[j];
        if (other[1] === ((event[1] + (m - c)) % 12)) {
          other[0] -= (m - dist);
        } else {
          break;
        }
      }
    }
  }
  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
