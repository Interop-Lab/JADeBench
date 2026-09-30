function Main(input) {
  console.log("Hello, " + input);
}

Main(require('fs').readFileSync(0, 'utf-8').trim());
