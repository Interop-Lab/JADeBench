const fs = require('fs');

function main(lines) {
  const [targetCount, attackRadius, damagePerAttack] = lines[0]
    .split(' ')
    .map(Number);

  const targets = [];
  for (let lineIndex = 1; lineIndex <= targetCount; lineIndex++) {
    const [position, health] = lines[lineIndex].split(' ').map(Number);
    targets.push({ position, health });
  }
  targets.sort((left, right) => left.position - right.position);

  let attackCount = 0;
  for (let index = 0; index < targetCount; index++) {
    const target = targets[index];
    if (target.health <= 0) {
      continue;
    }

    const attacksNeeded = Math.ceil(target.health / damagePerAttack);
    attackCount += attacksNeeded;

    const lastAffectedPosition = target.position + attackRadius * 2 + 1;
    for (let affectedIndex = index; affectedIndex < targetCount; affectedIndex++) {
      const affectedTarget = targets[affectedIndex];
      if (affectedTarget.position > lastAffectedPosition) {
        break;
      }
      affectedTarget.health -= damagePerAttack * attacksNeeded;
    }
  }

  console.log(attackCount);
}

const input = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
main(input);
