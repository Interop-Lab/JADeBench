const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');
const lineCount = lines.shift();

const typeAPattern = /^>'(=+)#\1~$/;
const typeBPattern = /^>\^(Q=)+~~$/;

for (let index = 0; index < lineCount; index += 1) {
  const line = lines[index];

  if (typeAPattern.test(line)) {
    console.log('A');
  } else if (typeBPattern.test(line)) {
    console.log('B');
  } else {
    console.log('NA');
  }
}
