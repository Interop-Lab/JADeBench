'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const recordCount = lines.shift().split(' ')[1];
  const statusesByName = {};

  for (let index = 0; index < recordCount; index++) {
    const fields = lines[index].split(' ');
    const name = fields[0];
    const status = fields[1];

    if (statusesByName[name] === undefined) {
      statusesByName[name] = status;
    } else {
      statusesByName[name] += `,${status}`;
    }
  }

  let acceptedCount = 0;
  let rejectedBeforeAcceptanceCount = 0;

  for (const name of Object.keys(statusesByName)) {
    const statuses = statusesByName[name].split(',');

    for (const status of statuses) {
      if (status == 'AC') {
        acceptedCount++;
        break;
      }

      rejectedBeforeAcceptanceCount++;
    }
  }

  console.log(`${acceptedCount} ${rejectedBeforeAcceptanceCount}`);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
