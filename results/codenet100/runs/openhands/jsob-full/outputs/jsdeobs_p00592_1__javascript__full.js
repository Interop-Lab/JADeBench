const fs = require('fs');

function timeToMinutes(time) {
  const digits = time.split('').map(Number);
  const hours = digits[0] * 10 + digits[1];
  const minutes = digits[2] * 10 + digits[3];
  return hours * 60 + minutes;
}

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const header = lines.shift();
  if (header === '0 0 0') break;

  const [participantCountText, windowStartText, windowEndText] = header.split(' ');
  const participantCount = Number(participantCountText);
  const windowStart = timeToMinutes(windowStartText);
  const windowEnd = timeToMinutes(windowEndText);
  const intervalCoverage = [];

  for (let minute = windowStart; minute < windowEnd; minute++) {
    intervalCoverage[minute] = 0;
  }

  for (let participant = 0; participant < participantCount; participant++) {
    const intervalCount = Number(lines.shift());
    const intervalTimes = lines.shift().split(' ');

    for (let interval = 0; interval < intervalCount; interval++) {
      const start = timeToMinutes(intervalTimes.shift());
      const end = timeToMinutes(intervalTimes.shift());

      for (let minute = start; minute < end; minute++) {
        intervalCoverage[minute]++;
      }
    }
  }

  let longestRun = 0;
  let currentRun = 0;

  for (let minute = windowStart; minute < windowEnd; minute++) {
    if (intervalCoverage[minute] !== participantCount) {
      currentRun++;
    } else {
      longestRun = Math.max(longestRun, currentRun);
      currentRun = 0;
    }
  }

  longestRun = Math.max(longestRun, currentRun);
  console.log(longestRun);
}
