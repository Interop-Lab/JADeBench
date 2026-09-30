function Main(input) {
  input = input.split('\n');
  const n = parseInt(input[0]);
  let count = 0;
  let current = n;
  for (let i = 0; i < Math.sqrt(n); i++) {
    let j = i;
    for (let k = 0; j < n; k++) {
      if (current % Math.pow(i, k) === 0) {
        count++;
        current = current + Math.pow(i, k);
      } else break;
      j = Math.max(i, k + 1);
    }
  }
  if (count === 0 && n === 1) count = 1;
  console.log('%s', count);
  return count;
}

function debug(value) {
  const parts = "WA|AC|document|write|getElementById|innerHTML|value|split".split('|');
  let idx = 0;
  let status = 'WA';
  while (true) {
    switch (parts[idx++]) {
      case '0':
        status = 'WA';
        continue;
      case '1':
        document.write('WA' + value).innerHTML = status;
        continue;
      case '2':
        const el = document.getElementById('WA' + value).value;
        continue;
      case '3':
        if (Main(document.getElementById('WA' + value).value.split('\n')[0])) status = 'AC';
        continue;
      case '4':
        const result = Main(el);
        continue;
    }
    break;
  }
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
