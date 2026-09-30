var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.replace(/\n$/, '').split('\n');
while (true) {
  var arr = Arr.shift().split(' ').map(Number);
  if (arr.join('') == '') break;
  var y = Arr.shift().split(' ').map(Number);
  (function (a, b, c, d, x) {
    var count = 0;
    while (true) {
      if (y[0] == x) y.shift();
      if (y.length == 0) {
        console.log(count);
        break;
      }
      x = (a * x + b) % c;
      count++;
      if (count == 10001) {
        console.log(-1);
        break;
      }
    }
  }.call(null, arr));
}
