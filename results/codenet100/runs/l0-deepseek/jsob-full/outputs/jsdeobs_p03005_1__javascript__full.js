const main = (input) => {
  const lines = input.trim().split('\n');
  const first = parseInt(lines[0].split(' ')[0]);
  const second = parseInt(lines[1].split(' ')[0]);
  console.log(second === 0 ? -1 : first - second);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
