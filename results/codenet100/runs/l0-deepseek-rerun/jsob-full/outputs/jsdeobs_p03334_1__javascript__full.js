function Main(input) {
  const nums = input.split(' ').map(x => +x);
  const n = nums[0];
  const a = calc(nums[1]);
  const b = calc(nums[2]);
  const results = [];
  let count = 0;
  for (let i = 0; i < 2 * n; i++) {
    for (let j = 0; j < 2 * n; j++) {
      if (f(a, i, j) && f(b, i, j)) {
        results[count++] = i + ' ' + j;
      }
      if (count === n * n) {
        console.log(results.join('\n'));
        return;
      }
    }
  }
}

function calc(x) {
  let count = 0;
  while ((x & 1) === 0) {
    count++;
    x >>>= 1;
  }
  return [count, x & 1];
}

function f(arr, i, j) {
  i = Math.floor(i / arr[0]);
  if (!arr[0]) return !(i & 1);
  j = Math.floor(j / arr[0]);
  return !((j + i) & 1);
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
