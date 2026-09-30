'use strict';

function main(input) {
  const lines = input.split('\n');
  const submissionCount = lines.shift().split(' ')[1];
  const verdictsByProblem = {};

  for (let index = 0; index < submissionCount; index++) {
    const [problem, verdict] = lines[index].split(' ');

    if (verdictsByProblem[problem] === undefined) {
      verdictsByProblem[problem] = String(verdict);
    } else {
      verdictsByProblem[problem] += `,${verdict}`;
    }
  }

  let solvedProblems = 0;
  let failedAttempts = 0;

  for (const problem of Object.keys(verdictsByProblem)) {
    const verdicts = verdictsByProblem[problem].split(',');

    for (const verdict of verdicts) {
      if (verdict == 'AC') {
        solvedProblems++;
        break;
      }

      failedAttempts++;
    }
  }

  console.log(`${solvedProblems} ${failedAttempts}`);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
