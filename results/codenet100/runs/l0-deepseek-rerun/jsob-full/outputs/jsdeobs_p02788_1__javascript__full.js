function main(input) {
  const lines = input[0].split(' ').map(Number);
  const n = lines[0];
  const k = lines[1];
  const x = lines[2];
  let arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(input[i].split(' ').map(v => v - 0));
  }
  arr = arr.sort((a, b) => a[0] - b[0]);
  let ans = 0;
  for (let i = 0; i < n; i++) {
    const item = arr[i];
    if (item[0] > 0) {
      const take = Math.floor(item[1] / x);
      ans += take;
      for (let j = i; j < n; j++) {
        const cur = arr[j];
        if (cur[0] <= item[0] + (k - 1)) {
          cur[1] -= x * take;
        } else {
          break;
        }
      }
    }
  }
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'));
