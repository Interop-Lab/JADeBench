const fs = require("fs");

/** Convert an HHMM time string to minutes after midnight. */
function timeToMinutes(time) {
  const digits = time.split("").map(Number);
  return digits[0] * 600 + digits[1] * 60 + digits[2] * 10 + digits[3];
}

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");

while (true) {
  const caseHeader = lines.shift();
  if (caseHeader == "0 0 0") break;

  const fields = caseHeader.split(" ");
  const participantCount = fields[0] - 0;
  const rangeStart = timeToMinutes(fields[1]);
  const rangeEnd = timeToMinutes(fields[2]);
  const busyCount = [];

  for (let minute = rangeStart; minute < rangeEnd; minute++) {
    busyCount[minute] = 0;
  }

  for (let participant = 0; participant < participantCount; participant++) {
    const intervalCount = lines.shift();
    const intervals = lines.shift().split(" ");

    for (let interval = 0; interval < intervalCount; interval++) {
      const start = timeToMinutes(intervals.shift());
      const end = timeToMinutes(intervals.shift());

      for (let minute = start; minute < end; minute++) {
        busyCount[minute]++;
      }
    }
  }

  let longestAvailablePeriod = 0;
  let currentAvailablePeriod = 0;

  for (let minute = rangeStart; minute < rangeEnd; minute++) {
    if (busyCount[minute] != participantCount) {
      currentAvailablePeriod++;
    } else {
      longestAvailablePeriod = Math.max(
        longestAvailablePeriod,
        currentAvailablePeriod,
      );
      currentAvailablePeriod = 0;
    }
  }

  longestAvailablePeriod = Math.max(
    longestAvailablePeriod,
    currentAvailablePeriod,
  );
  console.log(longestAvailablePeriod);
}
