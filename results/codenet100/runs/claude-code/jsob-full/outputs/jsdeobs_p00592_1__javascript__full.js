const fs = require('fs');

function parseTime(time) {
  const digits = time.split('').map(Number);
  return (digits[0] * 10 + digits[1]) * 60 + digits[2] * 10 + digits[3];
}

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const caseHeader = lines.shift();
  if (caseHeader === '0 0 0') break;

  const [participantCountText, periodStartText, periodEndText] = caseHeader.split(' ');
  const participantCount = Number(participantCountText);
  const periodStart = parseTime(periodStartText);
  const periodEnd = parseTime(periodEndText);
  const busyParticipantCounts = [];

  for (let slot = periodStart; slot < periodEnd; slot++) {
    busyParticipantCounts[slot] = 0;
  }

  for (let participant = 0; participant < participantCount; participant++) {
    const busyPeriodCount = Number(lines.shift());
    const busyPeriods = lines.shift().split(' ');

    for (let period = 0; period < busyPeriodCount; period++) {
      const busyStart = parseTime(busyPeriods.shift());
      const busyEnd = parseTime(busyPeriods.shift());

      for (let slot = busyStart; slot < busyEnd; slot++) {
        busyParticipantCounts[slot]++;
      }
    }
  }

  let longestAvailableRun = 0;
  let currentAvailableRun = 0;

  for (let slot = periodStart; slot < periodEnd; slot++) {
    if (busyParticipantCounts[slot] !== participantCount) {
      currentAvailableRun++;
    } else {
      longestAvailableRun = Math.max(longestAvailableRun, currentAvailableRun);
      currentAvailableRun = 0;
    }
  }

  longestAvailableRun = Math.max(longestAvailableRun, currentAvailableRun);
  console.log(longestAvailableRun);
}
