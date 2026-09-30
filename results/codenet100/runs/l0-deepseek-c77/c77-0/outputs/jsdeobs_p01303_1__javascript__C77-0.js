const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.replace(/\n$/, '').split('\n');
const N = Arr.length - 0;
for (let I = 0; I < N; I++) {
  let cnt = 0;
  const xywh = Arr.shift().split(' ').map(Number);
  const x1 = xywh[0];
  const y1 = xywh[1];
  const x2 = xywh[0] + xywh[2];
  const y2 = xywh[1] + xywh[3];
  const n = Arr.shift() - 0;
  for (let i = 0; i < n; i++) {
    const XY = Arr.shift().split(' ').map(Number);
    const X = XY[0];
    const Y = XY[1];
    if (x1 <= X && x2 >= X && y1 <= Y && y2 >= Y) cnt++;
  }
  console.log(cnt);
}
