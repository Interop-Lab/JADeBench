function Main(input) {
    const lines = input.split('\n');
    const requirements = lines[0].split(' ').map(Number);
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
        const dimensions = lines[i].split(' ').map(Number);

        if (
            dimensions[0] >= requirements[1] &&
            dimensions[1] >= requirements[2]
        ) {
            count++;
        }
    }

    console.log(count);
}

Main(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
        .trim()
);
