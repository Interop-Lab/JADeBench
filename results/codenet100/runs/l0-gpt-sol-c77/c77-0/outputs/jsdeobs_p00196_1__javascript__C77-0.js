var fs = require('fs');

var input = fs.readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

while (true) {
    var teamCount = lines.shift() - 0;

    if (teamCount == 0) {
        break;
    }

    var teams = [];

    for (var i = 0; i < teamCount; i++) {
        var results = lines.shift().split(' ');
        var name = results.shift();
        var wins = 0;
        var losses = 0;
        var j;

        for (j = 0; j < teamCount - 1; j++) {
            if (results[j] - 0 === 0) {
                wins++;
            }
            if (results[j] - 0 === 1) {
                losses++;
            }
        }

        var score = wins * 100 + (10 - losses) + (10 - j) * 0.01;
        teams.push([name, score]);
    }

    teams.sort(function (first, second) {
        return second[1] - first[1];
    });

    teams.forEach(function (team) {
        console.log(team[0]);
    });
}
