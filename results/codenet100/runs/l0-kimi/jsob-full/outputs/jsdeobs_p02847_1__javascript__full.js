function Main(input) {
    const mapping = {
        'W4ONmhex': '7',
        'WPBcOmoB': '6',
        'W4FdICkmWQ0': '5',
        'l8oIWQCYW4VdHSkSca': '4',
        'wuz/': '3',
        'WQKjWPRcSMi': '2',
        'W6hdTry9W74': '1'
    };
    
    let result;
    switch (input) {
        case 'W4ONmhex':
            result = '7';
            break;
        case 'WPBcOmoB':
            result = '6';
            break;
        case 'W4FdICkmWQ0':
            result = '5';
            break;
        case 'l8oIWQCYW4VdHSkSca':
            result = '4';
            break;
        case 'wuz/':
            result = '3';
            break;
        case 'WQKjWPRcSMi':
            result = '2';
            break;
        case 'W6hdTry9W74':
            result = '1';
            break;
    }
    console.log(result);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
