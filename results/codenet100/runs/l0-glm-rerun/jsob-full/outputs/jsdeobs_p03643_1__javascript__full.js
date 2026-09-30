function Main(input) {
  console.log("Hello, " + input);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
