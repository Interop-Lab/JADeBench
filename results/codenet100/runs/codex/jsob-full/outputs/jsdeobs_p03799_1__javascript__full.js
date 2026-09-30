const fs = require('fs');

function calculateMaximumGroups(firstResource, secondResource) {
  if (firstResource > secondResource / 2) {
    return Math.floor(secondResource / 2);
  }

  const groupsUsingBothResources = firstResource;
  const remainingSecondResource = secondResource - groupsUsingBothResources * 2;
  return groupsUsingBothResources + Math.floor(remainingSecondResource / 4);
}

function main(input) {
  const tokens = input.split(' ');
  const secondResource = Number(tokens[1]);
  const firstResource = Number(tokens[0]);
  const maximumGroups = calculateMaximumGroups(firstResource, secondResource);
  console.log(maximumGroups);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
