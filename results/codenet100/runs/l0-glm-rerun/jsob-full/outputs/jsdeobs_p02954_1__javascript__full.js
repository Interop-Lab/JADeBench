function Main(input) {
  var chars = input.split('');
  var counts = [];
  var result = [];

  for (let i = 0; i < chars.length; i++) {
    counts.push(0);
    result.push(0);
  }

  var temp = result.slice();

  for (let i = 0; i < counts.length + (counts.length - 1); i++) {
    for (let j = 0; j < counts.length; j++) {
      if (chars[j] === 'R') {
        temp[j + 1] += counts[j];
      } else if (chars[j] === 'L') {
        temp[j - 1] += counts[j];
      }
    }
    counts = temp.slice();
    temp = result.slice();
  }

  console.log(counts.join(' '));
}

Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
