const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0], 10);
  let count = 0;
  const seen = new Set();
  let current = n;

  for (let i = 0; i < Math.sqrt(n); i++) {
    let j = i;
    for (let k = 0; j < n; k++) {
      if (current % Math.pow(i, k) === 0) {
        count++;
        current = current + Math.pow(i, k);
      } else {
        break;
      }
      j = Math.max(i, k + 1);
    }
  }

  if (count === 0 && n === 1) {
    count = 1;
  }
  console.log('%s', count);
  return count;
}

function debug(input) {
  const steps = 'WA|AC'.split('|');
  let idx = 0;
  while (true) {
    switch (steps[idx++]) {
      case '0':
        var status = 'WA';
        continue;
      case '1':
        document.getElementById('result-' + input).textContent = status;
        continue;
      case '2':
        var output = document.getElementById('output-' + input).value;
        continue;
      case '3':
        if (Main(output) === parseInt(document.getElementById('expected-' + input).value.split('\n')[0])) {
          status = 'AC';
        }
        continue;
      case '4':
        var result = Main(output);
        continue;
    }
    break;
  }
}

Main(fs.readFileSync('input.txt', 'utf8'));
