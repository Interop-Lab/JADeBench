function getPair(num) {
  const binary = num.toString(2);
  const inverted = binary.split('').map(bit => bit === '1' ? '0' : '1').join('');
  return parseInt(inverted, 2);
}

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const nums = lines[0].split(' ').map(Number);
  let arr = nums.slice();
  let count = 0;
  while (arr.length > 0) {
    let first = arr[0];
    arr.splice(0, 1);
    let pair = getPair(first);
    let idx = arr.indexOf(pair);
    if (idx >= 0) {
      arr.splice(idx, 1);
      count++;
    }
  }
  console.log(count);
}

main(require('fs').readFileSync('in', 'utf8'));
