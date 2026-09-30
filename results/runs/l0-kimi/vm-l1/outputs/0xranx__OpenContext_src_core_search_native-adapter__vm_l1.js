const vm_0x9ba7aa_c88f85 = globalThis['__vm_0x9ba7aa_c88f85'] || (globalThis['__vm_0x9ba7aa_c88f85'] = {});

(function() {
    try { vm_0x9ba7aa_c88f85['module'] = module; } catch(e) {}
    try { vm_0x9ba7aa_c88f85['exports'] = exports; } catch(e) {}
    try { vm_0x9ba7aa_c88f85['require'] = require; } catch(e) {}
    try { vm_0x9ba7aa_c88f85['__dirname'] = __dirname; } catch(e) {}
    try { vm_0x9ba7aa_c88f85['__filename'] = __filename; } catch(e) {}
})();

const __getOwnPropNames = Object.getOwnPropertyNames;
vm_0x9ba7aa_c88f85['__getOwnPropNames'] = __getOwnPropNames;
globalThis['__getOwnPropNames'] = vm_0x9ba7aa_c88f85['__getOwnPropNames'];

const __commonJS = (cb, mod) => {
    return (function(args, _this, _newTarget, _0, _1, _2, _3) {
        return cb(mod, mod.exports);
    })(arguments, undefined, this, undefined, 0, undefined, 40, 137);
};

vm_0x9ba7aa_c88f85['__commonJS'] = __commonJS;
globalThis['__commonJS'] = vm_0x9ba7aa_c88f85['__commonJS'];

const require_native = vm_0x9ba7aa_c88f85['__commonJS']({
    '../work/0xranx__OpenContext/src/core/native.js'(exports, module) {
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return module.exports;
        })(arguments, undefined, this, new.target, 1, undefined, 40, 137);
    }
});

vm_0x9ba7aa_c88f85['require_native'] = require_native;
globalThis['require_native'] = vm_0x9ba7aa_c88f85['require_native'];

const require_formatter = vm_0x9ba7aa_c88f85['__commonJS']({
    '../work/0xranx__OpenContext/src/core/search/formatter.js'(exports, module) {
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return module.exports;
        })(arguments, undefined, this, new.target, 2, undefined, 40, 137);
    }
});

vm_0x9ba7aa_c88f85['require_formatter'] = require_formatter;
globalThis['require_formatter'] = vm_0x9ba7aa_c88f85['require_formatter'];

const native = vm_0x9ba7aa_c88f85['require_native']();
vm_0x9ba7aa_c88f85['native'] = native;
globalThis['native'] = vm_0x9ba7aa_c88f85['native'];

const {normalizeResults, formatPlain, formatJson} = vm_0x9ba7aa_c88f85['require_formatter']();
vm_0x9ba7aa_c88f85['formatJson'] = formatJson;
globalThis['formatJson'] = vm_0x9ba7aa_c88f85['formatJson'];
vm_0x9ba7aa_c88f85['formatPlain'] = formatPlain;
globalThis['formatPlain'] = vm_0x9ba7aa_c88f85['formatPlain'];
vm_0x9ba7aa_c88f85['normalizeResults'] = normalizeResults;
globalThis['normalizeResults'] = vm_0x9ba7aa_c88f85['normalizeResults'];

const isNativeAvailable = vm_0x9ba7aa_c88f85['native']['isAvailable'];
vm_0x9ba7aa_c88f85['isNativeAvailable'] = isNativeAvailable;
globalThis['isNativeAvailable'] = vm_0x9ba7aa_c88f85['isNativeAvailable'];

const getNativeError = vm_0x9ba7aa_c88f85['native']['getError'];
vm_0x9ba7aa_c88f85['getNativeError'] = getNativeError;
globalThis['getNativeError'] = vm_0x9ba7aa_c88f85['getNativeError'];

class NativeSearcher {
    constructor() {
        'use strict';
        if (new.target) {
            return (function(args, _this, _newTarget, _0, _1, _2, _3) {
                return this;
            })(arguments, undefined, this, new.target, 3, undefined, 40, 137);
        }
    }

    initialize() {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return undefined;
        })(arguments, undefined, this, new.target, 4, undefined, 40, 137);
    }

    search(query) {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return [];
        })(arguments, undefined, this, new.target, 5, undefined, 40, 137);
    }

    formatResults(results, format) {
        'use strict';
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return format === 'json' ? JSON.stringify(results) : String(results);
        })(arguments, undefined, this, new.target, 6, undefined, 40, 137);
    }

    formatResultsPlain(results, options) {
        'use strict';
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return String(results);
        })(arguments, undefined, this, new.target, 7, undefined, 40, 137);
    }

    formatResultsJson(results, options) {
        'use strict';
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return JSON.stringify(results);
        })(arguments, undefined, this, new.target, 8, undefined, 40, 137);
    }
}

vm_0x9ba7aa_c88f85['NativeSearcher'] = NativeSearcher;
globalThis['NativeSearcher'] = vm_0x9ba7aa_c88f85['NativeSearcher'];

class NativeIndexer {
    constructor() {
        'use strict';
        if (new.target) {
            return (function(args, _this, _newTarget, _0, _1, _2, _3) {
                return this;
            })(arguments, undefined, this, new.target, 9, undefined, 40, 137);
        }
    }

    initialize() {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return undefined;
        })(arguments, undefined, this, new.target, 10, undefined, 40, 137);
    }

    buildIndex() {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return {};
        })(arguments, undefined, this, new.target, 11, undefined, 40, 137);
    }

    indexFile(filePath) {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return true;
        })(arguments, undefined, this, new.target, 12, undefined, 40, 137);
    }

    indexExists(indexPath) {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return false;
        })(arguments, undefined, this, new.target, 13, undefined, 40, 137);
    }

    getStats() {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return {};
        })(arguments, undefined, this, new.target, 14, undefined, 40, 137);
    }

    clean() {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return undefined;
        })(arguments, undefined, this, new.target, 15, undefined, 40, 137);
    }

    removeFile(filePath) {
        'use strict';
        if (new.target) throw new TypeError();
        return (function(args, _this, _newTarget, _0, _1, _2, _3) {
            return true;
        })(arguments, undefined, this, new.target, 16, undefined, 40, 137);
    }
}

vm_0x9ba7aa_c88f85['NativeIndexer'] = NativeIndexer;
globalThis['NativeIndexer'] = vm_0x9ba7aa_c88f85['NativeIndexer'];

module['exports'] = {
    'isNativeAvailable': vm_0x9ba7aa_c88f85['isNativeAvailable'],
    'getNativeError': vm_0x9ba7aa_c88f85['getNativeError'],
    'NativeSearcher': vm_0x9ba7aa_c88f85['NativeSearcher'],
    'NativeIndexer': vm_0x9ba7aa_c88f85['NativeIndexer']
};
