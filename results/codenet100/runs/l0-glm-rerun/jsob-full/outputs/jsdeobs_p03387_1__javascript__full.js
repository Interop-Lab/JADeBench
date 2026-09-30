function Main(input) {
  var lines = input.split('\n')[1].split(' ').map(x => parseInt(x, 10)).sort((a, b) => a - b);
  var count = 0;

  if ((lines[1] - lines[0]) % 2 === 0) {
    count += (lines[2] - lines[1]) / 2;
    lines[0] += count;
    count += lines[2] - lines[0];
  } else {
    lines[2]++;
    lines[1]++;
    count++;
    count += (lines[2] - lines[0]) / 2;
    lines[0] += count;
    count += lines[2] - lines[0];
  }

  console.log(count);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
