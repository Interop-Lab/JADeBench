function Main(input) {
  const lines = input.split('\n');
  const nums = lines[1].split(' ').map(x => parseInt(x, 10)).sort((a, b) => b - a);
  let result = 0;
  if ((nums[0] - nums[1] - 2) % 2 === 0) {
    result += nums[0] - nums[1];
    nums[2] += result;
    result += (nums[1] - nums[2]) / 2;
  } else {
    const cases = "0|1|2|3|4|5".split('|');
    let i = 0;
    while (true) {
      switch (cases[i++]) {
        case '0':
          nums[0] += nums[1] - nums[2];
          continue;
        case '1':
          result += nums[0] - nums[1];
          continue;
        case '2':
          result++;
          continue;
        case '3':
          result += (nums[0] - nums[1]) / 2;
          continue;
        case '4':
          nums[1]++;
          continue;
        case '5':
          nums[2]++;
          continue;
      }
      break;
    }
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
