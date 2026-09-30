function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  let count = 0;
  let remaining = n;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    let power = i;
    for (let exp = 1; power < n; exp++) {
      if (remaining % Math.pow(i, exp) === 0) {
        count++;
        remaining = remaining / Math.pow(i, exp);
      } else {
        break;
      }
      power = Math.pow(i, exp + 1);
    }
  }
  if (count === 0 && n !== 1) {
    count = 1;
  }
  console.log('%s', count);
  return count;
}

function debug(id) {
  const input = document.getElementById('input' + id).value;
  const result = Main(input);
  let status = 'WA';
  if (result == document.getElementById('output' + id).innerHTML.split('\n')[0]) {
    status = 'AC';
  }
  document.getElementById('result' + id).innerHTML = status;
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
