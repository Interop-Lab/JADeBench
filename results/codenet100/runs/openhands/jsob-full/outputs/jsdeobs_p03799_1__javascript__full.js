const fs = require('fs');

function main(input) {
  const values = input.split(' ');
  const firstResourceCount = Number(values[0]);
  let secondResourceCount = Number(values[1]);
  let groupCount = 0;

  if (firstResourceCount > secondResourceCount / 2) {
    groupCount += Math.floor(secondResourceCount / 2);
  } else {
    groupCount += firstResourceCount;
    secondResourceCount -= groupCount * 2;
    groupCount += Math.floor(secondResourceCount / 4);
  }

  console.log(groupCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
