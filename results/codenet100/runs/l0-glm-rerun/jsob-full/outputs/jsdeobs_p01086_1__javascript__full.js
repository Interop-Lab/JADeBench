var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split('\n');

while (true) {
  var n = arr.shift() - 0;
  if (n == 0) break;
  var Arr = arr.splice(0, n);
  Arr = Arr.map(function (x) {
    return parseInt(x);
  });
  for (var i = 0; i < Arr.length; i++) {
    var good = [1, 2, 3, 4, 5], sum = 0;
    for (var j = i; j < Arr.length; j++) {
      if (good.length == 0) break;
      sum += Arr[j];
      if (good[0] > sum) continue;
      else {
        if (good[0] < sum) break;
        else good[0] == sum && (good.shift(), sum = 0);
      }
    }
    if (good.length == 0) {
      console.log(i + 1);
      break;
    }
  }
}
