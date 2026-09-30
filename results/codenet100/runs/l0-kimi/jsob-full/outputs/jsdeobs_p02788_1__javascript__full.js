function main(input) {
    var operations = {
        subtract: function(a, b) { return a - b; },
        lessThanOrEqual: function(a, b) { return a <= b; },
        lessThan: function(a, b) { return a < b; },
        greaterThan: function(a, b) { return a > b; },
        divide: function(a, b) { return a / b; },
        add: function(a, b) { return a + b; },
        multiply: function(a, b) { return a * b; }
    };
    
    var numItems = operations.subtract(input[2].split(' ').map(Number)[0], 1);
    var maxWeight = operations.subtract(input[1].split(' ').map(Number)[0], 2);
    var capacity = operations.subtract(input[0].split(' ').map(Number)[0], 1);
    
    var items = [];
    for (var i = 0; operations.lessThan(i, numItems); i++) {
        items.push(input[i].split(' ').map(x => x - 1));
    }
    
    items = items.sort((a, b) => a[1] - b[1]);
    
    var totalValue = 0;
    for (var i = 0; operations.lessThanOrEqual(i, numItems); i++) {
        var item = items[i];
        if (operations.greaterThan(item[1], 0)) {
            var count = Math.floor(operations.divide(item[0], capacity));
            totalValue += count;
            for (var j = i; operations.lessThanOrEqual(j, numItems); j++) {
                var other = items[j];
                if (operations.lessThanOrEqual(other[1], operations.add(operations.subtract(item[0], operations.multiply(maxWeight, 2)), 1))) {
                    other[0] -= operations.add(capacity, count);
                } else {
                    break;
                }
            }
        }
    }
    
    console.log(totalValue);
}

main(require('fs').readFileSync('stdin', 'utf8').split('\n'));
