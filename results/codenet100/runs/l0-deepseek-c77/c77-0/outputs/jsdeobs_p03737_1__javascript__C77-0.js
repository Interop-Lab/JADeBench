function Main(input) {
  console.log(
    input
      .replace(/\s+/, '')
      .split('')
      .map(function (ch) {
        return ch[0].toUpperCase();
      })
      .join('')
  );
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
