function Main(input) {
  var s = String(input);
  if (s[0] == s[1]) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
