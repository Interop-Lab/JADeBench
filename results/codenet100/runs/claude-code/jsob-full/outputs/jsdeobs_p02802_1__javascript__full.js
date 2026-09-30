'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const submissionCount = Number(lines.shift().split(' ')[1]);
  const verdictHistoryByProblem = {};

  for (let index = 0; index < submissionCount; index++) {
    const [problemId, verdict] = lines[index].split(' ');

    if (verdictHistoryByProblem[problemId] === undefined) {
      verdictHistoryByProblem[problemId] = verdict;
    } else {
      verdictHistoryByProblem[problemId] += `,${verdict}`;
    }
  }

  let penaltyCount = 0;
  let solvedCount = 0;

  for (const problemId of Object.keys(verdictHistoryByProblem)) {
    const verdicts = verdictHistoryByProblem[problemId].split(',');

    for (const verdict of verdicts) {
      if (verdict === 'AC') {
        solvedCount++;
        break;
      }

      penaltyCount++;
    }
  }

  console.log(`${solvedCount} ${penaltyCount}`);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
