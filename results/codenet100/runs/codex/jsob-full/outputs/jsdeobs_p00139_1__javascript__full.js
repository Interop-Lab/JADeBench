const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');
const lineCount = lines.shift();

for (let index = 0; index < lineCount; index++) {
  const line = lines[index];

  if (/^>'(=+)#\1~$/.test(line)) {
    console.log('A');
  } else if (/^>\^(Q=)+~~$/.test(line)) {
    console.log('B');
  } else {
    console.log('NA');
  }
}
