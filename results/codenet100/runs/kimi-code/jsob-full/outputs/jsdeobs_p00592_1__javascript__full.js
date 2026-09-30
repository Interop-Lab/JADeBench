const fs = require('fs');

function parseTime(time) {
  const digits = time.split('').map(Number);
  return digits[0] * 10 * 60 + digits[1] * 60 + digits[2] * 10 + digits[3];
}

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const header = lines.shift();
  if (header === '0 0 0') {
    break;
  }

  const [participantCountText, periodStartText, periodEndText] = header.split(' ');
  const participantCount = participantCountText - 0;
  const periodStart = parseTime(periodStartText);
  const periodEnd = parseTime(periodEndText);
  const availabilityCounts = [];

  for (let minute = periodStart; minute < periodEnd; minute++) {
    availabilityCounts[minute] = 0;
  }

  for (let participant = 0; participant < participantCount; participant++) {
    const intervalCount = lines.shift();
    const intervalTimes = lines.shift().split(' ');

    for (let interval = 0; interval < intervalCount; interval++) {
      const start = parseTime(intervalTimes.shift());
      const end = parseTime(intervalTimes.shift());

      for (let minute = start; minute < end; minute++) {
        availabilityCounts[minute]++;
      }
    }
  }

  let longestUnavailablePeriod = 0;
  let currentUnavailablePeriod = 0;

  for (let minute = periodStart; minute < periodEnd; minute++) {
    if (availabilityCounts[minute] !== participantCount) {
      currentUnavailablePeriod++;
    } else {
      longestUnavailablePeriod = Math.max(
        longestUnavailablePeriod,
        currentUnavailablePeriod,
      );
      currentUnavailablePeriod = 0;
    }
  }

  longestUnavailablePeriod = Math.max(
    longestUnavailablePeriod,
    currentUnavailablePeriod,
  );
  console.log(longestUnavailablePeriod);
}
