function Main(input) {
  const value = String(input);
  if (value[0] === value[5]) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

Main(require('fs').readFileSync('stdin', 'utf8'));
