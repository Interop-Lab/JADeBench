function Main(source) {
    const input = source.replace(/\n/g, " ").split(" ");
    let inputIndex = 0;

    const first = parseInt(input[inputIndex++], 10);
    const second = parseInt(input[inputIndex++], 10);
    const result = (first * second) / (first + second);

    console.log(result.toFixed(10) + "\n");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
