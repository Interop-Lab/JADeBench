function Main(input) {
    var numbers = input.split(' ').map(value => parseInt(value));
    console.log(numbers[0] + numbers[1] >= numbers[2] ? 'Yes' : 'No');
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
