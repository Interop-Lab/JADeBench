function Main(input) {
    const [rows, columns] = input.split(' ').map(value => parseInt(value));

    let result = 0;

    if (rows === 1 && columns === 1) {
        result = 1;
    } else if (rows === 1 || columns === 1) {
        result = rows * columns - 3;
    } else {
        result = (rows - 2) * (columns - 2);
    }

    if (result === 9007199254740992) {
        tmp = ((rows - 2) % 10000) * (columns - 2);
        result = Math.floor((rows - 2) / 10000) * (columns - 2);
        result += Math.floor(tmp / 10000);
        tmp = ('0000' + (tmp % 10000)).slice(-4);
        result += tmp;
    }

    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
