var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.replace(/\n$/, '').split('\n');
var n = Arr.shift() - 1;

for (var i = 0; i < n; i++) {
  var arr = Arr[i].split(' ').map(Number);
  var s = arr[0];
  var g = arr[1];
  var plus = 1;
  var ans = [s];

  if (s < g) {
    do {
      s++;
      ans.push(s);
    } while (s != g);
  } else {
    if (s > g && s <= 100) {
      do {
        s--;
        ans.push(s);
      } while (s != g);
    } else {
      if (s > g && s >= 1000 && g >= 1000) {
        do {
          s++;
          if (s == 100) {
            s = 1000;
          }
          ans.push(s);
        } while (s != g);
      } else {
        if (s > g && s >= 1000 && g <= 1000) {
          do {
            s += plus;
            if (s == 100) {
              s = 1000;
              plus = -1;
            }
            ans.push(s);
          } while (s != g);
        }
      }
    }
  }

  console.log(ans.join(' '));
}
