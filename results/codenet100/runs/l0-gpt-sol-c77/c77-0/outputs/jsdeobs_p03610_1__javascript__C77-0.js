function Main(input) {
  const firstLine = input.split('\n')[0];
  let output = '';

  for (let index = 0; index < firstLine.length; index += 2) {
    output += firstLine[index];
  }

  console.log(output);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
