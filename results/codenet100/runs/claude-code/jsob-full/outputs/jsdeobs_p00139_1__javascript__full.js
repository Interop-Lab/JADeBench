const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');
const lineCount = lines.shift();

const patternA = /^>'(=+)#\1~$/;
const patternB = /^>\^(Q=)+~~$/;

for (let index = 0; index < lineCount; index++) {
  const line = lines[index];

  if (patternA.test(line)) {
    console.log('A');
  } else if (patternB.test(line)) {
    console.log('B');
  } else {
    console.log('NA');
  }
}
