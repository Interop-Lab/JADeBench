'use strict';

const fs = require('fs');

function countSubmissionResults(input) {
  const lines = input.split('\n');
  const submissionCount = lines.shift().split(' ')[1];
  const resultsByEntry = {};

  for (let index = 0; index < submissionCount; index++) {
    const [entry, result] = lines[index].split(' ');

    if (resultsByEntry[entry] === undefined) {
      resultsByEntry[entry] = String(result);
    } else {
      resultsByEntry[entry] += `,${result}`;
    }
  }

  let acceptedEntries = 0;
  let unsuccessfulAttempts = 0;

  for (const entry of Object.keys(resultsByEntry)) {
    const results = resultsByEntry[entry].split(',');

    for (const result of results) {
      if (result === 'AC') {
        acceptedEntries++;
        break;
      }
      unsuccessfulAttempts++;
    }
  }

  console.log(`${acceptedEntries} ${unsuccessfulAttempts}`);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
countSubmissionResults(input);
