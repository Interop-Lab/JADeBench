const fs = require('fs');

function parseTime(time) {
  const digits = time.split('').map(Number);
  const hours = digits[0] * 10 + digits[1];
  const minutes = digits[2] * 10 + digits[3];
  return hours * 60 + minutes;
}

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const header = lines.shift();
  if (header === '0 0 0') break;

  const [participantCountText, rangeStartText, rangeEndText] = header.split(' ');
  const participantCount = Number(participantCountText);
  const rangeStart = parseTime(rangeStartText);
  const rangeEnd = parseTime(rangeEndText);
  const availableCounts = [];

  for (let minute = rangeStart; minute < rangeEnd; minute++) {
    availableCounts[minute] = 0;
  }

  for (let participant = 0; participant < participantCount; participant++) {
    const intervalCount = Number(lines.shift());
    const intervalTimes = lines.shift().split(' ');

    for (let interval = 0; interval < intervalCount; interval++) {
      const availableFrom = parseTime(intervalTimes.shift());
      const availableUntil = parseTime(intervalTimes.shift());

      for (let minute = availableFrom; minute < availableUntil; minute++) {
        availableCounts[minute]++;
      }
    }
  }

  let longestUnavailableDuration = 0;
  let currentUnavailableDuration = 0;

  for (let minute = rangeStart; minute < rangeEnd; minute++) {
    if (availableCounts[minute] !== participantCount) {
      currentUnavailableDuration++;
    } else {
      longestUnavailableDuration = Math.max(
        longestUnavailableDuration,
        currentUnavailableDuration,
      );
      currentUnavailableDuration = 0;
    }
  }

  longestUnavailableDuration = Math.max(
    longestUnavailableDuration,
    currentUnavailableDuration,
  );
  console.log(longestUnavailableDuration);
}
