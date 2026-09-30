function Main(input) {
  var ops = {
    add: function (a, b) { return a + b; },
    sub: function (a, b) { return a - b; }
  };
  input = input.trim();
  console.log(ops.add(1000, ops.sub(2000, input.length)));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
