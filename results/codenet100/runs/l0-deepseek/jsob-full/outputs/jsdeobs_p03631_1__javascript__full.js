const fs = require('fs');
function Main(input) {
  const s = String(input);
  if (s[0] === s[1]) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}
Main(fs.readFileSync('stdin', 'utf8'));
