function Main(input) {
  var values = input.split('\n').map(Number);
  var a = values[0];
  var b = values[1];
  var c = values[2];

  console.log((a + 1 - b) * (a + 1 - c));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
