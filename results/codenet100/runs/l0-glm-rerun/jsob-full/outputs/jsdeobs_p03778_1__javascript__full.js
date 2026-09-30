const main = input => {
  const nums = input.split(' ').map(s => parseInt(s));
  const a = nums[0];
  const b = nums[1];
  const c = nums[2];
  const d = a + c;
  const e = b + c;
  let result = [];
  if (b < c) {
    result = [b, d, c, e];
  } else {
    result = [c, e, b, d];
  }
  if (result[0] < result[3]) {
    console.log(result[0] + result[1]);
  } else {
    console.log(0);
  }
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
