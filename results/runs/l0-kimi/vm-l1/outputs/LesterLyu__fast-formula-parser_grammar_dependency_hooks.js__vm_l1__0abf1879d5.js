const vm_0x4ed3f0_9b256f = {};

(function() {
    try {
        vm_0x4ed3f0_9b256f.module = module;
    } catch(e) {}
    try {
        vm_0x4ed3f0_9b256f.exports = exports;
    } catch(e) {}
    try {
        vm_0x4ed3f0_9b256f.require = require;
    } catch(e) {}
    try {
        vm_0x4ed3f0_9b256f.__dirname = __dirname;
    } catch(e) {}
    try {
        vm_0x4ed3f0_9b256f.__filename = __filename;
    } catch(e) {}
})();

const __getOwnPropNames = Object.getOwnPropertyNames;
vm_0x4ed3f0_9b256f.__getOwnPropNames = __getOwnPropNames;
globalThis.__getOwnPropNames = vm_0x4ed3f0_9b256f.__getOwnPropNames;

const __commonJS = (cb, mod) => {
    return vm_0xe187d_903d9a(undefined, this, [cb, mod], undefined, undefined, 0, 53, 150, 247);
};
vm_0x4ed3f0_9b256f.__commonJS = __commonJS;
globalThis.__commonJS = vm_0x4ed3f0_9b256f.__commonJS;

const require_collection = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/grammar/type/collection.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 1, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_collection = require_collection;
globalThis.require_collection = vm_0x4ed3f0_9b256f.require_collection;

const require_helpers = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/formulas/helpers.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 2, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_helpers = require_helpers;
globalThis.require_helpers = vm_0x4ed3f0_9b256f.require_helpers;

const require_error = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/formulas/error.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 3, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_error = require_error;
globalThis.require_error = vm_0x4ed3f0_9b256f.require_error;

const require_lexing = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/grammar/lexing.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 4, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_lexing = require_lexing;
globalThis.require_lexing = vm_0x4ed3f0_9b256f.require_lexing;

const require_parsing = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/grammar/parsing.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 5, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_parsing = require_parsing;
globalThis.require_parsing = vm_0x4ed3f0_9b256f.require_parsing;

const require_operators = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/formulas/operators.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 6, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_operators = require_operators;
globalThis.require_operators = vm_0x4ed3f0_9b256f.require_operators;

const require_utils = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 7, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_utils = require_utils;
globalThis.require_utils = vm_0x4ed3f0_9b256f.require_utils;

const require_utils2 = vm_0x4ed3f0_9b256f.__commonJS({
    '../work/LesterLyu__fast-formula-parser/grammar/utils.js'(exports, module) {
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 8, 53, 150, 247);
    }
});
vm_0x4ed3f0_9b256f.require_utils2 = require_utils2;
globalThis.require_utils2 = vm_0x4ed3f0_9b256f.require_utils2;

const FormulaError = vm_0x4ed3f0_9b256f.require_error();
vm_0x4ed3f0_9b256f.FormulaError = FormulaError;
globalThis.FormulaError = vm_0x4ed3f0_9b256f.FormulaError;

const { FormulaHelpers } = vm_0x4ed3f0_9b256f.require_helpers();
vm_0x4ed3f0_9b256f.FormulaHelpers = FormulaHelpers;
globalThis.FormulaHelpers = vm_0x4ed3f0_9b256f.FormulaHelpers;

const { Parser } = vm_0x4ed3f0_9b256f.require_parsing();
vm_0x4ed3f0_9b256f.Parser = Parser;
globalThis.Parser = vm_0x4ed3f0_9b256f.Parser;

const lexer = vm_0x4ed3f0_9b256f.require_lexing();
vm_0x4ed3f0_9b256f.lexer = lexer;
globalThis.lexer = vm_0x4ed3f0_9b256f.lexer;

const Utils = vm_0x4ed3f0_9b256f.require_utils();
vm_0x4ed3f0_9b256f.Utils = Utils;
globalThis.Utils = vm_0x4ed3f0_9b256f.Utils;

const { formatChevrotainError } = vm_0x4ed3f0_9b256f.require_utils2();
vm_0x4ed3f0_9b256f.formatChevrotainError = formatChevrotainError;
globalThis.formatChevrotainError = vm_0x4ed3f0_9b256f.formatChevrotainError;

class DepParser {
    constructor(options) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 9, 53, 150, 247);
    }
    
    parse(formula) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 10, 53, 150, 247);
    }
    
    getDependencies(formula) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 11, 53, 150, 247);
    }
    
    getVariable(name) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 12, 53, 150, 247);
    }
    
    retrieveRef(ref) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 13, 53, 150, 247);
    }
    
    callFunction(name, args) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 14, 53, 150, 247);
    }
    
    getRange(ref) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 15, 53, 150, 247);
    }
    
    checkFormulaResult(name, result) {
        'use strict';
        return vm_0xe187d_903d9a(undefined, this, arguments, new.target, undefined, 16, 53, 150, 247);
    }
}

vm_0x4ed3f0_9b256f.DepParser = DepParser;
globalThis.DepParser = vm_0x4ed3f0_9b256f.DepParser;

module.exports = {
    DepParser: vm_0x4ed3f0_9b256f.DepParser
};
