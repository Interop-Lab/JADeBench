function Main(input) {
    var lines = input.split('\n');
    var n = parseInt(lines[0], 10);
    var arr = lines[1].split(' ');
    var sqrtArr = new Array(n);
    var sum = 0;
    var result = 0;
    var mod = 1000000007;
    
    for (var i = 0; i < n; i++) {
        arr[i] = parseInt(arr[i], 10);
        sqrtArr[i] = Math.sqrt(arr[i]);
        arr[i] = arr[i] * arr[i];
    }
    
    for (var i = 0; i < n - 1; i++) {
        for (var j = i + 1; j < n; j++) {
            sum += arr[i] * arr[j];
            if (sum >= 1000000000000000000) {
                sum = sum % mod;
                result += 0.5;
            }
            result += sqrtArr[i] * sqrtArr[j];
        }
    }
    
    sum = sum % mod;
    result = result * mod;
    sum = sum + result;
    sum = sum % mod;
    
    console.log(sum);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
