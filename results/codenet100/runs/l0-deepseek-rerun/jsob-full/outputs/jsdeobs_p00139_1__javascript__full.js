const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.replace(/\n$/, '').split('\n');
const n = Arr.length;
for (let i = 0; i < n; i++) {
  if (/^>'(=+)#\1~$/.test(Arr[i])) {
    console.log('A');
  } else if (/^>\^(Q=)+~~$/.test(Arr[i])) {
    console.log('B');
  } else {
    console.log('NA');
  }
}
