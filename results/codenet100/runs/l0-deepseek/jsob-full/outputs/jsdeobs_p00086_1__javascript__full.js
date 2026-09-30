const fs = require('fs');
const input = fs.readFileSync('in', 'utf8');
const lines = input.split('\n');

while (lines.length > 0) {
  const path = [];
  const odds = path.filter(function (x) {
    return x % 2 == 1;
  });

  let line;
  while ((line = lines.shift()) != null) {
    const nums = line.split(' ');
    const from = +nums[0];
    const to = +nums[1];
    path[from] = (path[from] || 0) + 1;
    path[to] = (path[to] || 0) + 1;
  }

  if (path[0] % 2 == 0 && path[1] % 2 == 1 && odds.length > 0) {
    console.log('NG');
  } else {
    console.log('OK');
  }
}
