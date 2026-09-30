const Main = (input) => {
  const numbers = input.trim().split(' ').map((token) => parseInt(token, 10));
  let a = numbers[0];
  let b = numbers[1];
  let gcd = 0;
  let lcm = 0;
  const originalA = a;
  const originalB = b;

  if (a >= b) {
    while (b > 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    gcd = a;
  } else {
    while (a > 0) {
      const remainder = b % a;
      b = a;
      a = remainder;
    }
    gcd = b;
  }

  lcm = (originalA * originalB) / gcd;
  console.log(lcm);
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
