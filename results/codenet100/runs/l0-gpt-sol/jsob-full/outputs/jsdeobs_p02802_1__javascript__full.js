'use strict';

function Main(input) {
    const lines = input.split('\n');
    const submissionCount = lines.shift().split(' ')[1];
    const resultsByProblem = {};

    for (let i = 0; i < submissionCount; i++) {
        const problem = lines[i].split(' ')[0];
        const result = lines[i].split(' ')[1];

        if (resultsByProblem[problem] === undefined) {
            resultsByProblem[problem] = '' + result;
        } else {
            resultsByProblem[problem] += ',' + result;
        }
    }

    let wrongAttempts = 0;
    let solvedProblems = 0;
    const problems = Object.keys(resultsByProblem);

    for (let i = 0; i < problems.length; i++) {
        const problem = problems[i];
        const results = resultsByProblem[problem].split(',');

        for (let j = 0; j < results.length; j++) {
            if (results[j] == 'AC') {
                solvedProblems++;
                break;
            }

            wrongAttempts++;
        }
    }

    console.log(solvedProblems + ' ' + wrongAttempts);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
