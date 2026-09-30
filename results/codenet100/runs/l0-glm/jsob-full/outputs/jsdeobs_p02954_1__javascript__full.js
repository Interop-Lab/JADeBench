function Main(input) {
  var chars = input.split('');
  var left = [];
  var right = [];
  for (let i = 0; i < chars.length; i++) {
    left.push(0);
    right.push(0);
  }
  var result = right.slice().reverse();
  for (let i = 0; i < left.length + left.length - 1; i++) {
    for (let j = 0; j < left.length; j++) {
      if (chars[j] === 'R') {
        result[j] += left[j];
      } else if (chars[j] === 'L') {
        result[j] += left[j];
      }
    }
    left = result.slice();
    result = right.slice();
  }
  console.log(left.join(' '));
}
Main(require('fs').readFileSync('./input', 'utf8'));
