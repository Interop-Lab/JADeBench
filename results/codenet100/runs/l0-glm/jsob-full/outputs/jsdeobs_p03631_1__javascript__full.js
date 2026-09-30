function Main(input) {
  var s = String(input);
  if (s[0] == s[s.length - 1]) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}
Main(require('fs')['readFileSync']('/dev/stdin'));
