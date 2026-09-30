const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');
const routeCount = Number(lines.shift());

for (let index = 0; index < routeCount; index++) {
  const [start, destination] = lines[index].split(' ').map(Number);
  const route = [start];
  let current = start;

  if (current < destination) {
    do {
      current++;
      route.push(current);
    } while (current !== destination);
  } else if (current > destination && current <= 5) {
    do {
      current--;
      route.push(current);
    } while (current !== destination);
  } else if (current > destination && current >= 6 && destination >= 6) {
    do {
      current++;
      if (current === 10) {
        current = 5;
      }
      route.push(current);
    } while (current !== destination);
  } else if (current > destination && current >= 6 && destination <= 5) {
    let direction = 1;
    do {
      current += direction;
      if (current === 10) {
        current = 5;
        direction = -1;
      }
      route.push(current);
    } while (current !== destination);
  }

  console.log(route.join(' '));
}
