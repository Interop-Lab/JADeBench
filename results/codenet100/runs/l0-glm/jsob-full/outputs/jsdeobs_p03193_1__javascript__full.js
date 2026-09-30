function Main(input) {
  var lines = input.split('\n');
  var first = lines[0].split(' ').map(Number);
  var count = 0;
  for (var i = 1; i < lines.length; i++) {
    var parts = lines[i].split(' ').map(Number);
    if (parts[0] < first[0] && parts[1] >= first[1]) count++;
  }
  console.log(count);
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
