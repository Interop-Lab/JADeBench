'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const submissionCount = lines.shift().split(' ')[1];
  const statusesByProblem = {};

  for (let index = 0; index < submissionCount; index++) {
    const [problem, status] = lines[index].split(' ');
    const previousStatuses = statusesByProblem[problem];

    statusesByProblem[problem] =
      previousStatuses === undefined ? String(status) : `${previousStatuses},${status}`;
  }

  let failedAttempts = 0;
  let acceptedProblems = 0;

  for (const problem of Object.keys(statusesByProblem)) {
    const statuses = statusesByProblem[problem].split(',');

    for (const status of statuses) {
      if (status === 'AC') {
        acceptedProblems++;
        break;
      }

      failedAttempts++;
    }
  }

  console.log(`${acceptedProblems} ${failedAttempts}`);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
