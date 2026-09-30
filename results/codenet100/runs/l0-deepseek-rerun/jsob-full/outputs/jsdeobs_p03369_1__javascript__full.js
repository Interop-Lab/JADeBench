const fs = require('fs');

function main(input) {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    if (input[i] == 'o') {
      count++;
    }
  }
  console.log(0x4d * 0x3a + 0x6 * 0x3ee + 0xae * 0x5 + count * (0xe00 - 0x23c - 0xb60));
}

main(fs.readFileSync('stdin', 'utf8'));
