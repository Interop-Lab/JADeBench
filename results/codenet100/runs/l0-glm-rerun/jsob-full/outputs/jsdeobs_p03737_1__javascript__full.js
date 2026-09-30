function Main(input) {
  console.log((input || '').replace(/\s+/g, function(word) {
    return word[0].toUpperCase();
  }).replace(/\s+/g, ''));
}

Main(require('fs').readFileSync(0, 'utf8'));
