function Main(input) {
    var handlers = {};
    handlers["add"] = function(a, b) {
        return a + b;
    };
    handlers["prefix"] = "Result: ";
    console.log(handlers["add"](handlers["prefix"], input));
}
Main(require('fs')['readFileSync']('input.txt', 'utf8'));
