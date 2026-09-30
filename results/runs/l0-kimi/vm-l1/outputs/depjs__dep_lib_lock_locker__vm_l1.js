import { writeFileSync } from 'fs';
import path from 'path';

let globalContext = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : void 0;
let vmContext = globalContext['vm'] || (globalContext['vm'] = {});

(function() {
    if (!vmContext['module']) try { vmContext['module'] = module; } catch(e) {}
    if (!vmContext['exports']) try { vmContext['exports'] = exports; } catch(e) {}
    if (!vmContext['require']) try { vmContext['require'] = require; } catch(e) {}
    if (!vmContext['__dirname']) try { vmContext['__dirname'] = __dirname; } catch(e) {}
    if (!vmContext['__filename']) try { vmContext['__filename'] = __filename; } catch(e) {}
})();

const vmRuntime = (function() {
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var defineProperty = Object.defineProperty;
    var weakMapGet = WeakMap.prototype.get;
    var getPrototypeOf = Object.getPrototypeOf;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var weakSetHas = WeakSet.prototype.has;
    var create = Object.create;
    var weakSetAdd = WeakSet.prototype.add;
    var weakMapSet = WeakMap.prototype.set;
    var weakMapHas = WeakMap.prototype.has;
    var functionApply = Function.prototype.apply;
    var setPrototypeOf = Object.setPrototypeOf;
    var functionCall = Function.prototype.call;
    var reflectApply = Reflect.apply;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;

    let stringTable = [
        'Super constructor may only be called once',
        'getOwnPropertyDescriptor',
        ' is not defined',
        '7UxEjaz',
        '_$KeYLAr',
        'symbol',
        'Cannot delete property \'',
        ' (setting ',
        'fWzzm+ZKiibmUy6d7VyWXMo5XcmKgY4QEMgGXM5qXibuhzUZ7vTN0cHqU3J+bNAYbGmKpKCYEh7Vimb0XNSPTcwvOiximY3ViimVikbpUQpkUixiq3m6A3HVijrgUQVuUiNNi3xpl3mViCHgpjbgUQ03i35NUQneimxiFim6Fim6K3xwL37ViOippubVUyrVULippOQgpOQgpTrVUdZMUQVuUi9eimxpqig6EixiS376qig6',
        'number',
        'add',
        'defineProperties',
        'Cannot access \'',
        '_$81ErA4',
        'setPrototypeOf',
        '_$7JwXYG',
        'Iterator result ',
        'defineProperty',
        'fWzvu+ZpiiHKpK1yjc2KA3HNqigViixipm==',
        '_$BQadBk',
        '_$rZXPdU',
        'parent',
        '_$iaySmM',
        'join',
        'iterator \'return\' is not callable',
        '\' of \'',
        '_$SIUDIn',
        'fWzzp+ZpiUbKgNYl8KD9xNYqEmb7xIyyxGDCU3AzOKgJfmb7m9DNXNDPU3yNxNSCU3XrXh3Vi3bm8KSn8V6AjNxKMK6yxI2IoixUUQUgUQpNi3xi63NZiQxiA3HVipb6qigVitbpUQgNpj3MUQf/i3xMC3m6riHVUpbVitbpUQgNpOQgpOQgUQh/i3NRUiNRUixKK3xpL376riHVitbpUQQNUQZNUQs4iQxpB3gVitbpUQQNUQ4Npj3MUQtcUixiA3HVMpbVMPbVMQr6q3mVgfbgUQ+cimxiA3HVMpbVgubVi1bgUQ5OUQVqiQNZiQxpY3mVitbpUQQNUJgNUJgtp8HgUJpIUixgB3gVitbpUQQNUJHNUQucUix6K3xUSi76li7ViAbgUQpNi3x763xu63xup39uUixmC3mVU8bUUQpNi3x763xn63xwY3mVpTrVidmMpj3MUQtcUixiA3HVMpbVgPbVgQr6q3mVgfbgUQjcimxiA3HVMpbVwpbVUAbgUQ5OUQVqiQNZiQxpY3mVitbpUQQNUJmNUJmtp8HgUQpNi3x763xD63NZiQxpY3mVitbpUQQNUJ2NUJ2tp8HgUQpNi3x763xc63NZiQxpY3mVitbpUQQNUJbNUJbtp8Hgiiiii3MeimxUY3mViAbgphr6q3miiiipi+ZUUJv/i3xiA3HVMubiI0biitrgpxbppOipUQKcUixXLi76riHVKyrVKLQMphr6q3m0b9piibZU93KRijQUP3VOiE3Us3V4ibHp5iH=',
        '_$NBzPJl',
        'isSync',
        'Cannot assign to read only property \'',
        'fWzzp+ZKUympU3HaU3iKKN1aXKDdjcS58cJYxP4KwNJyxGT6jNTYEgSNUyQajNS5XDSCjITBjKDzfQxUU3AzjKYvXmxiUQ6ZUQKNi3xMB3gViUr6li7Vi1bgpj3MUQ0cUixUk3HiI0biitrgpjQgUQf/i3xMk3HiI0biitrgUQtNi3Mb13ii/3mVUobUUQpNi3xgY3m6Yig6li7VU6bgp8iUUQ0cUiNZUiNZiQN0im9mimxMY3m6riHVUpbVUErppOQgpOQgUQbOUQVeiQxwB3gVUXbgUQbOpcQiGlbiitrgpj3MUQf/i3N4UixMY3m6riHVUPbVpUr6Fim6FimVUXbgpOQgpOQgUQ5OUQfeiQN3i3xMB3g6q3m6aim6S376qigmU9mtwUHc6WQQoYUcDKJPUi==',
        '\'<computed key>\'',
        '\'new\'',
        'get',
        'Cannot redefine property: ',
        '_$Kxt1W7',
        'vm_0x2fc2b0_6e9ad3',
        'ownKeys',
        'process',
        '\' of object',
        'configurable',
        'create',
        'asyncIterator',
        '\' before initialization',
        '213596akAIkA',
        'locker_default',
        'reject',
        '\'super\' keyword is only valid inside a derived constructor',
        '166WiTFGj',
        'enumerable',
        'exports',
        'Iterator result is not an object',
        'getOwnPropertyNames',
        '_$BnKaDa',
        ' is not a constructor or null',
        'Cannot destructure property \'',
        'indexOf',
        'Cannot set properties of ',
        'Assignment to constant variable.',
        'message',
        'return',
        '_$vhcFKk',
        'Cannot set property \'',
        'fWzvp+ZpiirKMgSWONDv8ibHOID1xQbKxKC9Uy15XhXgXhUYjNTYjNoAXh7ViTkIUtip6/bp6WO3iRrgq3nKi/QgFimOL3+mimxipmxUUQiVi3xMpm56pm56UQmVim5pMym=',
        '_$OcVEjo',
        '_$dckmKb',
        '_$roqoX6',
        'Must call super constructor in derived class before accessing \'this\' or returning from derived constructor',
        ' is not an object',
        '1754710XEOrHR',
        'keyFor',
        'imul',
        'AsyncFunction',
        'toString',
        ' is not a function',
        'getUint32',
        'valueOf',
        'iterator',
        'next',
        '__dirname',
        'Cannot convert object to primitive value',
        ' is not iterable',
        'getUint16',
        'charCodeAt',
        'outer',
        'JSON',
        'Cannot read properties of ',
        'throw',
        'The iterator does not provide a throw method',
        'isArray',
        'The iterator does not provide a \'throw\' method.',
        'Arguments',
        ' to object',
        'proto',
        'AsyncGeneratorFunction',
        'object',
        '_$uGXjRP',
        'set',
        'Super constructor ',
        'Iterator method returned a non-object value',
        'module',
        '_$M4au2f',
        '\' as it is ',
        'Class extends value ',
        '_$UiOyQA',
        'iter',
        ' of ',
        '_$V9Mfrd',
        '_$i4YXZq',
        'has',
        'fWzvu+ZpiiHKgY4QEMDvbzTN7iJbUQigUQMeimiUiiHiA3HVi7rpp8Hgpm==',
        '_$iAnrzP',
        '_$vnfURj',
        '\'caller\', \'callee\', and \'arguments\' properties may not be accessed on strict mode functions or the arguments objects for calls to them',
        'raw',
        '711090eppyne',
        'value',
        '1688268XWsaOQ',
        '_$vAiM0V',
        '_$wlAZCN',
        'path',
        'fill',
        'Super expression must be a constructor',
        'name',
        'anonymous',
        '_$pMLhlw',
        'then',
        'resolveFrom',
        '_$jPq7k6',
        'desc',
        'constructor',
        'fWzvp+ZpiirKMgSWONDv8ibHOID1xQbKxKC9UWyaxVTAjI1yjgTYxKDlXKDlbIYYxQxUVFbgriHNA3HN6/ipP3nuU7bpFiuRUUFeiSiUUQi6UQgViixpUQ76pm56pm5VUixUpmH0wi==',
        '\' of object which has only a getter',
        'variable',
        '_$AikG7a',
        'mGCCaF',
        ' (reading ',
        '_$gQfucR',
        'fWzvp+Zpi3ZKw96YxISR8NDKxNSCUy6d7V3B7KXWXMiKiixMwY3ViimVifbgUQMcimxUL3giiiipi0rpUQtNi3xiY3mViTrViLmMUQ+mim5=',
        'Unexpected signal in async generator',
        'forEach',
        '_$Tjn3mb',
        'fWzvp+ZppvrKgY4QEK657ITYXibuhzUZ7n850nT5UyAljITYhIBaXVDRXh7aU3ylbcBYU31IXh6zOcSlU31qbh6WbcJRU3XBxNQKgV6YxISR8ND5UyXqjqYl8KD9xNYqEmxUUy6Aj9TYXG6A8V5KHKyyxqYlxGTyjKJnbG6AxVmpU31ROcoYj9oYU31YjN8AjNDzU3TaxQbKbGUBU3yROc6vU3XWOcZKgK1a8gDCxVT1UyUPXhwBOh6YxQbbXKDQXc15Xc1vOcDzUWyaxVTAjI1yjgTYxKDlXKDlbIYYxQb3xKDYx5TYxKDlXKDlbIYYxQb0X9DlXKYlXQbuhzUZ7vTN0cHqU31NjKwq8KDlU3HaUQ+li3xicixiUiiiiiHiL3gVitbppXmUUQVcimiUiiHiL3gVilrpiovNiip/UixiA3HiI0biitrgUQfcim9Ki3xMB3gViXbgUQ7NpOippj3Mp8HgUQKcUixM63xiA3Hiqebiitrgpj3MUQ0cUixUY3mViPbViQr6q3mVi1bgUQKcUixg63xgp39uUixUY3mVUub6riH6P3m6q3mViXbgUQbNUQncimxgY3m6li7Vi1bgUQucUixVp39uUixHC3mVUCbUUQKcUixKY3mVpTrVidmMUQhcimxwY3m6li7Vi1bgUQccUixtp39uUixUY3mVpPb6li7Vi1bgUQQOUQRtp8HgUQKcUixo63NZiQxMY3mViXbgUQqNUQqtp8HgUQKcUix063NZiQxMY3mViXbgUQZNUQZtp8HgUQKcUix+63NZiQxMY3mViXbgUQ4NUQ4tp8HgUQKcUixm63NZiQxMY3mViXbgUJiNUJitp8HgUQKcUixT63NZiQxMY3mViXbgUJgNUJgtp8HgUQKcUixu63NZiQxMY3mViXbgUJHNUJHtp8HgUJ0IUixVB3gViXbgUJmNUQEcUix6K3xUSi76li7Vi1bgUQKcUix263xDp39uUixnC3mVpobUUQKcUixc63xHY3mVpTrVidmMpj3MUQ0cUixUY3mVwWbVw3r6q3mVgsbgUQ9cimxUY3mVwPbVpXbgUQ5OUQVqiQNZiQxMY3mViXbgUJxNUJxtp8HgUQKcUixb63NZiQxMY3mViXbgUJ3NUJ3tp8HgiiHii3MeimxpY3mVi1bgphr6q3mViXbgUJ2Npj3MUJ/IUixtB3gViXbgUJ2NUQtcUixjk3HiI0biitrgiiHii3MeimxtY3mVVUrViLmMp8HgHWHlfvAt2YX3xVAeWiK7iX3U9iKriOQUliK4ix3UziVbi8QUkiVIibHp5itxi/rpC3tkiRbpBifli3==',
        'Cannot convert ',
        'byteOffset',
        'resolve',
        'freeze',
        '_$lbPXe4',
        'getPrototypeOf',
        '243GTImqh',
        'includes',
        'getInt32',
        'Iterator next is not a function',
        'apply',
        '75340cRxfKN',
        'Cannot destructure \'',
        'iUpMgwKVH6tf7o0+mTun2DchbXOjx8Ed3yWv5YN9rA/FRClaQJPzqBIGZ1ks4SeL',
        ' is not a constructor',
        'Boolean',
        'newTarget',
        'function',
        'notEmpty',
        'construct',
        '_$lSNO3n',
        '15JHUyhr',
        'for',
        '_$GME8tT',
        'writable',
        'callee',
        '2420952IeFBfd',
        'call',
        'iterator.next is not a function',
        'fWzvp+ZpiUmKiibuhzUZ7v6N7N2zUy6d7V3zoKD5bn3KgY4QEMgGoziB0mHKUNTY83buhzUZoMmP7KwYUy6d7V3B0Mb1bN2KwNTY85SQ8KYajNwRUyUaxVTAjI1yjHiUciuNilrp/3uZiLbMqiVeiObpYiKZiLbMqiVeiObpYiKZiLZUA3t2iTrtq3nIiSiUL3KNiAmUritZiSHgL3KNiAmUli+eiObpYigOpCHgaineiObpYiKZiLZUA3t2iTrtq3u4U+ZUA3t2ij3ML3KNiAmUK3FuUixiUQiViixiiosNiii6pm5iimipiixipm56pmipiiHiUQi6pmiiiiHiUQi6UQmVUm56pmiMiiHiUQi6pm56iimii3iVii56iiiii3iVii5VUixHpm5iiQipiixipm5iiiipiixipmxgUQ56pmigiiHiUQi6pmiiiiHiUQi6UQmVpi5upyicVpHq+gXKDYuiiDJROriUxriU',
        'push',
        'Derived constructors may only return object or undefined',
        'length',
        '_$TNfrcv',
        'Object',
        'fWzzp+ZpiirKMgSWONDv8ibHOID1xQxUU3JRXc198K3VipiVitbppOippj3Mp8HgUQpIUiN3i3xU63xiA3H6Fim6FimViyrVidZMUQ7NUQmOioMNiip/Ui9mimHgV3==',
        'nextMethod',
        'fWzvu+ZpiimKgY4QEMgqXnTYoQbuhzUZ7nxG7M21gY3ViimVi+ZUii2ii3pNi3xiL3giiiipitbpUQp2imYkp8Hgpm==',
        'prototype',
        '_$gJ804e',
        ' is not iterable (cannot read property Symbol(Symbol.iterator))',
        '_$theSF3',
        '_$Arct5g',
        'require',
        'object null',
        'buffer',
        'writeFileSync',
        'toStringTag',
        '_$TxzZPy',
        'getOwnPropertySymbols',
        'GeneratorFunction',
        'fromCharCode',
        'undefined',
        'done'
    ];

    let functionTable = [
        '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'
    ];

    let constTable = {
        '0': 0x4f, '1': 0x1e3, '2': 0x62, '3': 0x11b, '4': 0xe5, '5': 0x18c, '6': 0x98, '7': 0x15e,
        '8': 0x72, '9': 0x74, '10': 0x1c, '11': 0x19, '12': 0x180, '13': 0x3a, '14': 0x4e, '15': 0x122,
        '16': 0x6b, '17': 0xc4, '18': 0x1ee, '19': 0xec, '20': 0x1c0, '21': 0x1fd, '22': 0x1da, '23': 0x6f,
        '24': 0x1d1, '25': 0x189, '26': 0xc9, '27': 0x4d, '28': 0x49, '29': 0x9a, '32': 0xee, '40': 0x10d,
        '41': 0x115, '42': 0x23, '43': 0x17b, '44': 0x1d4, '45': 0x159, '46': 0x7, '47': 0x147, '50': 0x112,
        '51': 0x4c, '52': 0xd9, '53': 0xae, '54': 0x47, '55': 0x140, '56': 0x119, '57': 0x1b1, '58': 0x106,
        '59': 0x56, '60': 0x1a1, '61': 0x17, '62': 0xe9, '63': 0x13f, '64': 0x1d6, '70': 0xd2, '71': 0x13,
        '72': 0xd5, '73': 0x5b, '74': 0x1b4, '75': 0x39, '76': 0x24, '77': 0x6e, '79': 0x105, '81': 0x4a,
        '83': 0xba, '84': 0x15, '90': 0x1bc, '91': 0x121, '93': 0xb1, '94': 0x44, '95': 0x17e, '100': 0x2c,
        '104': 0x143, '105': 0x177, '106': 0x1c4, '107': 0xfb, '110': 0x15f, '111': 0x100, '112': 0x173,
        '120': 0x178, '121': 0x134, '122': 0x11e, '123': 0xb3, '124': 0x88, '127': 0x19e, '128': 0x38,
        '129': 0x11a, '130': 0x1c5, '131': 0x76, '132': 0xed, '140': 0xb, '141': 0x1cf, '142': 0xe0,
        '143': 0x5e, '144': 0x9b, '145': 0xc5, '146': 0x149, '147': 0x32, '148': 0x195, '149': 0x1f9,
        '160': 0x1c1, '161': 0xfe, '162': 0xef, '163': 0x103, '164': 0x13b, '165': 0x14f, '166': 0xdc,
        '167': 0x1e2, '168': 0x1f7, '169': 0x8a, '180': 0x1ff, '181': 0x169, '182': 0x35, '183': 0x198,
        '184': 0x2e, '185': 0x1ae, '200': 0x45, '201': 0x18b, '210': 0xbc, '213': 0x42, '214': 0x17a,
        '220': 0x1af, '250': 0xd4, '251': 0xa2, '252': 0x1f, '253': 0x1b6, '254': 0x14c, '255': 0x73,
        '256': 0x170, '262': 0x3f, '263': 0xb6, '264': 0xd0, '265': 0x1e4, '266': 0x9d, '267': 0x186,
        '268': 0x92, '272': 0x118, '273': 0x17c, '274': 0x8d, '275': 0x55, '276': 0xfc, '277': 0x19c,
        '278': 0x1e6, '279': 0x1d, '280': 0xbe, '281': 0x181, '282': 0x18, '283': 0xeb, '284': 0x5a,
        '285': 0x97, '286': 0x7b, '287': 0x75, '288': 0x18f, '293': 0x196, '294': 0x9f, '295': 0x15a,
        '296': 0xa1, '297': 0xbb
    };

    const TYPE_YIELD = 0x1, TYPE_AWAIT = 0x2, TYPE_FOR_AWAIT = 0x3, TYPE_ITERATOR = 0x4;
    const FLAG_STRICT = 0x35, FLAG_GENERATOR = 0x113, FLAG_ASYNC = 0x5f;
    const TYPE_BIGINT = typeof 0n;
    const EMPTY_ARRAY = [];
    let generatorDepth = 0;

    const throwTypeError = function() {
        throw new TypeError('Cannot access caller, callee, and arguments properties on strict mode functions or the arguments objects for calls to them');
    };
    Object.preventExtensions(throwTypeError);

    let weakSet1 = new WeakSet(), weakSet2 = new WeakSet();
    const symbolKey = Symbol();
    let objectMap1 = {'__proto__': null}, objectMap2 = {'__proto__': null}, idCounter = 1;

    function bindObject(obj, data) {
        let id = obj[symbolKey];
        if (id === undefined) {
            id = idCounter++;
            obj[symbolKey] = id;
        }
        objectMap1[id] = data;
        objectMap2[id] = obj;
    }

    function getBoundData(obj) {
        let id = obj[symbolKey];
        if (id === undefined) return undefined;
        return objectMap2[id] === obj ? objectMap1[id] : undefined;
    }

    function hasBoundData(obj) {
        let id = obj[symbolKey];
        return id !== undefined && objectMap2[id] === obj;
    }

    let weakMap1 = new WeakMap(), arrayCache = [], arrayIterator = Array.prototype[Symbol.iterator], symbolIterator = Symbol.iterator;
    let generatorPrototype = null, asyncGeneratorPrototype = null, asyncGeneratorIterator = null, asyncFunctionPrototype = null;

    try {
        let gen = function*() {};
        generatorPrototype = setPrototypeOf(gen);
        asyncGeneratorIterator = generatorPrototype && generatorPrototype.prototype;
    } catch(e) {}

    try {
        let asyncGen = async function*() {};
        asyncGeneratorPrototype = setPrototypeOf(asyncGen);
        asyncGeneratorIterator = asyncGeneratorPrototype && asyncGeneratorPrototype.prototype;
    } catch(e) {}

    try {
        let asyncFn = async function() {};
        asyncFunctionPrototype = setPrototypeOf(asyncFn);
    } catch(e) {}

    function safeDefineProperty(obj, prop, desc) {
        try { defineProperty(obj, prop, desc); } catch(e) {}
    }

    function createArrayFromStack(popFn, count) {
        let arr = new Array(count), hasWeak = false;
        for (let i = count - 1; i >= 0; i--) {
            let val = popFn();
            if (val && typeof val === 'object' && weakSetHas.call(weakSet1, val)) {
                hasWeak = true;
                arr[i] = val;
            } else {
                arr[i] = val;
            }
        }
        if (!hasWeak) return arr;
        let result = [];
        for (let i = 0; i < count; i++) {
            let val = arr[i];
            if (val && typeof val === 'object' && weakSetHas.call(weakSet1, val)) {
                let inner = val.value;
                if (Array.isArray(inner)) {
                    for (let j = 0; j < inner.length; j++) result.push(inner[j]);
                }
            } else {
                result.push(val);
            }
        }
        return result;
    }

    function isObjectOrFunction(val) {
        return typeof val === 'object' || typeof val === 'function';
    }

    function createDataDescriptor(value) {
        return {value, writable: true, configurable: true};
    }

    function toObjectOrDefault(val, def) {
        return val && isObjectOrFunction(val) ? val : def;
    }

    function setPrototypeSafe(obj, proto) {
        try { setPrototypeOf(obj, proto); } catch(e) {}
    }

    function getMethod(obj, name) {
        let val = obj === null || obj === undefined ? undefined : obj[name];
        if (val === null || val === undefined) return undefined;
        if (typeof val !== 'function') throw new TypeError('Method is not callable');
        return val;
    }

    function assertObject(val) {
        if (val === null || (typeof val !== 'object' && typeof val !== 'function')) {
            throw new TypeError('Cannot convert ' + val + ' to object');
        }
    }

    function iteratorResult(iter) {
        let done = iter.done;
        return {done, value: done ? iter.value : undefined};
    }

    function getIteratorInfo(obj) {
        let syncMethod = getMethod(obj, Symbol.iterator);
        let nextMethod, isSync;
        if (syncMethod !== undefined) {
            let iter = reflectApply(syncMethod, obj, []);
            nextMethod = iter.next;
            isSync = false;
        } else {
            let asyncMethod = getMethod(obj, Symbol.asyncIterator);
            if (asyncMethod === undefined) throw new TypeError(typeof obj + ' is not iterable');
            let iter = reflectApply(asyncMethod, obj, []);
            nextMethod = iter.next;
            isSync = true;
        }
        if (nextMethod === null || typeof nextMethod !== 'function') throw new TypeError('iterator.next is not a function');
        return {iter, nextMethod, isSync};
    }

    function getKeys(obj) {
        let keys = [];
        for (let key in obj) keys.push(key);
        return keys;
    }

    function sliceArrayLike(arr) {
        return Array.prototype.slice.call(arr);
    }

    function getPrototype(val) {
        return typeof val === 'function' && val.prototype ? val.prototype : val;
    }

    function getConstructor(val) {
        if (typeof val === 'function') return setPrototypeOf(val);
        let proto = setPrototypeOf(val), ctorDesc = getOwnPropertyDescriptor(proto, 'constructor');
        let ctor = ctorDesc && ctorDesc.value;
        let isCtor = ctor && typeof ctor === 'function' && (ctor.prototype === proto || setPrototypeOf(ctor.prototype) === setPrototypeOf(proto));
        return isCtor ? setPrototypeOf(proto) : proto;
    }

    function lookupProperty(obj, name) {
        let curr = obj;
        while (curr !== null) {
            let desc = getOwnPropertyDescriptor(curr, name);
            if (desc) return {desc, proto: curr};
            curr = setPrototypeOf(curr);
        }
        return {desc: null, proto: obj};
    }

    function toPropertyKey(key) {
        let type = typeof key;
        if (key !== null && (type === 'object' || type === 'function')) {
            let temp = create(null);
            temp[key] = 0;
            return Reflect.ownKeys(temp)[0];
        }
        if (type !== 'symbol') return String(key);
        return key;
    }

    function findInScope(scope, fn) {
        let curr = scope;
        while (curr) {
            let idx = curr.scopeIndex;
            if (idx >= 0) {
                let arr = curr.scopeArray;
                if (arr) {
                    let res = fn(arr, idx);
                    if (res !== undefined) return res;
                }
            }
            curr = curr.parentScope;
        }
    }

    function updateScope(scope, value) {
        findInScope(scope, (arr, idx) => {
            if (arr[idx] === arr) arr[idx] = value;
        });
    }

    function getFromScope(scope) {
        return findInScope(scope, (arr, idx) => {
            let val = arr[idx];
            if (val !== arr && val !== undefined) return val;
        });
    }

    function wrapMethod(obj, name) {
        var orig = obj[name];
        var wrapped = function() {
            vmContext.isWrapped = true;
            var prev = vmContext.currentThis;
            vmContext.currentThis = obj;
            try {
                return Reflect.apply(orig, this, arguments);
            } finally {
                vmContext.currentThis = prev;
            }
        };
        Object.defineProperties(wrapped, {
            length: {value: orig.length, configurable: true},
            name: {value: orig.name, configurable: true}
        });
        obj[name] = wrapped;
        (vmContext.methodMap || (vmContext.methodMap = new WeakMap())).set(wrapped, obj);
    }
    vmContext.wrapMethod = wrapMethod;

    function setFunctionName(bytecode, func, key) {
        if (!bytecode[0xa * key[0] + key[1] & 0x1f] || !func) return;
        let name = bytecode[0x9 * key[0] + key[1] & 0x1f][bytecode[0xa * key[0] + key[1] & 0x1f]];
        safeDefineProperty(func, 'name', {value: name, writable: false, enumerable: false, configurable: true});
    }

    function bindFunction(func, bytecode, scope, key) {
        if (!func || bytecode[0x16 * key[0] + key[1] & 0x1f] || bytecode[0x7 * key[0] + key[1] & 0x1f] || bytecode[0x5 * key[0] + key[1] & 0x1f]) return;
        if (!hasBoundData(func)) bindObject(func, {b: bytecode, e: scope, c: bytecode});
    }

    function createFunction(executor, bytecode, scope, isNewTarget, globalObj, isGenerator) {
        let result;
        if (isGenerator) {
            if (isNewTarget) {
                result = {['mGCCaF']() {
                    'use strict';
                    let target = new.target !== undefined ? new.target : vmContext.newTarget;
                    if (new.target === undefined && 'newTarget' in vmContext && !('isNew' in vmContext)) delete vmContext.newTarget;
                    return executor(bytecode, result, target, scope, arguments, this);
                }}['mGCCaF'];
            } else {
                result = {['mGCCaF']() {
                    let target = new.target !== undefined ? new.target : vmContext.newTarget;
                    if (new.target === undefined && 'newTarget' in vmContext && !('isNew' in vmContext)) delete vmContext.newTarget;
                    return executor(bytecode, result, target, scope, arguments, this);
                }}['mGCCaF'];
            }
            try { delete result.prototype; } catch(e) {}
        } else {
            if (isNewTarget) {
                result = function() {
                    'use strict';
                    let target = new.target !== undefined ? new.target : vmContext.newTarget;
                    if (new.target === undefined && 'newTarget' in vmContext && !('isNew' in vmContext)) delete vmContext.newTarget;
                    return executor(bytecode, result, target, scope, arguments, this);
                };
            } else {
                result = function() {
                    let target = new.target !== undefined ? new.target : vmContext.newTarget;
                    if (new.target === undefined && 'newTarget' in vmContext && !('isNew' in vmContext)) delete vmContext.newTarget;
                    return executor(bytecode, result, target, scope, arguments, this);
                };
            }
        }
        bindObject(result, {b: bytecode, e: scope});
        return result;
    }

    function createAsyncFunction(executor, bytecode, scope, isNewTarget, globalObj) {
        let result;
        if (isNewTarget) {
            result = {['mGCCaF']() {
                'use strict';
                let target = new.target !== undefined ? new.target : vmContext.newTarget;
                if (new.target === undefined && 'newTarget' in vmContext && !('isNew' in vmContext)) delete vmContext.newTarget;
                return executor(bytecode, result, target, scope, arguments, this, undefined);
            }}['mGCCaF'];
        } else {
            result = {['mGCCaF']() {
                let target = new.target !== undefined ? new.target : vmContext.newTarget;
                if (new.target === undefined && 'newTarget' in vmContext && !('isNew' in vmContext)) delete vmContext.newTarget;
                return executor(bytecode, result, target, scope, arguments, this, undefined);
            }}['mGCCaF'];
        }
        if (asyncFunctionPrototype) setPrototypeSafe(result, asyncFunctionPrototype);
        return result;
    }

    function createGeneratorFunction(executor, bytecode, scope, isNewTarget, globalObj, isAsync) {
        let result;
        if (isNewTarget) {
            result = {['mGCCaF']() {
                'use strict';
                return executor(bytecode, result, scope, arguments, this, vmContext.currentThis);
            }}['mGCCaF'];
        } else {
            result = {['mGCCaF']() {
                return executor(bytecode, result, scope, arguments, this, vmContext.currentThis);
            }}['mGCCaF'];
        }
        weakSetAdd.call(isAsync ? weakSet2 : weakSet1, result);
        let proto = isAsync ? asyncGeneratorPrototype : generatorPrototype;
        let iteratorProto = isAsync ? asyncGeneratorIterator : asyncGeneratorIterator;
        if (proto) setPrototypeSafe(result, proto);
        try {
            defineProperty(result, 'prototype', {
                value: iteratorProto ? create(iteratorProto) : create({}),
                writable: true, enumerable: false, configurable: false
            });
        } catch(e) {}
        return result;
    }

    function createBoundFunction(target, scope, globalObj) {
        let prevThis = vmContext.currentThis;
        return {['mGCCaF']: (...args) => {
            if (prevThis !== undefined) {
                vmContext.isWrapped = true;
                vmContext.currentThis = prevThis;
            }
            return target(scope, result, undefined, scope, args, globalObj);
        }}['mGCCaF'];
    }

    function createArrowFunction(executor, scope, globalObj) {
        let result;
        result = {['mGCCaF']: (...args) => {
            return executor(scope, result, undefined, scope, args, globalObj, undefined);
        }}['mGCCaF'];
        if (asyncFunctionPrototype) setPrototypeSafe(result, asyncFunctionPrototype);
        return result;
    }

    function executeBytecode(bytecode, func, scope, outerScope, args, thisArg, newTarget) {
        let stack = [void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0];
        let sp = 0, key = getBytecodeKey(bytecode[0x20], bytecode[0x21]);
        let code, consts, jumpTable, exceptionTable;

        switch (key[1] & 0x3) {
            case 0x0:
                consts = bytecode[0x4 * key[0] + key[1] & 0x1f];
                code = bytecode[0x9 * key[0] + key[1] & 0x1f];
                jumpTable = bytecode[0x0 * key[0] + key[1] & 0x1f] || weakMapGet;
                exceptionTable = bytecode[0x12 * key[0] + key[1] & 0x1f] || weakMapGet;
                break;
            case 0x1:
                code = bytecode[0x9 * key[0] + key[1] & 0x1f];
                jumpTable = bytecode[0x0 * key[0] + key[1] & 0x1f] || weakMapGet;
                exceptionTable = bytecode[0x12 * key[0] + key[1] & 0x1f] || weakMapGet;
                consts = bytecode[0x4 * key[0] + key[1] & 0x1f];
                break;
            case 0x2:
                jumpTable = bytecode[0x0 * key[0] + key[1] & 0x1f] || weakMapGet;
                exceptionTable = bytecode[0x12 * key[0] + key[1] & 0x1f] || weakMapGet;
                consts = bytecode[0x4 * key[0] + key[1] & 0x1f];
                code = bytecode[0x9 * key[0] + key[1] & 0x1f];
                break;
            default:
                exceptionTable = bytecode[0x12 * key[0] + key[1] & 0x1f] || weakMapGet;
                consts = bytecode[0x4 * key[0] + key[1] & 0x1f];
                code = bytecode[0x9 * key[0] + key[1] & 0x1f];
                jumpTable = bytecode[0x0 * key[0] + key[1] & 0x1f] || weakMapGet;
        }

        let locals = new Array((bytecode[0x20] || 0) + (bytecode[0x21] || 0));
        let pc = 0, codeLen = code.length >> 1;
        let layout = ((bytecode[0x20] * 0x862f ^ bytecode[0x21] * 0x2729 ^ codeLen * 0x940b ^ code.length * 0x229f) >>> 0) & 0x3;
        let codeOffset, constOffset, jumpOffset;

        switch (layout) {
            case 0x1: codeOffset = 0; constOffset = codeLen; jumpOffset = 0; break;
            case 0x2: codeOffset = 0; constOffset = 1; jumpOffset = 1; break;
            case 0x3: codeOffset = codeLen; constOffset = 0; jumpOffset = 0; break;
            default: codeOffset = 1; constOffset = 0; jumpOffset = 1; break;
        }

        let exceptionStack = null, pendingException = null, isReturning = false, returnValue = undefined;
        let isBreaking = false, breakTarget = 0, breakScope = undefined;
        let isContinuing = false, continueTarget = 0, continueScope = undefined;
        let finallyStart = -1, finallyEnd = -1;
        let strictMode = !!bytecode[0xf * key[0] + key[1] & 0x1f];
        let hasArgs = !!bytecode[0xe * key[0] + key[1] & 0x1f];
        let needsSuper = !!bytecode[0x13 * key[0] + key[1] & 0x1f];
        let isDerived = !!bytecode[0x14 * key[0] + key[1] & 0x1f];
        let newTargetVal = newTarget, hasSuper = !!bytecode[0x5 * key[0] + key[1] & 0x1f];

        if (!strictMode && !hasArgs && (newTarget === undefined || newTarget === null)) {
            newTarget = globalContext;
        }

        let push = val => { stack[sp++] = val; };
        let pop = () => stack[--sp];
        let peek = () => stack[sp - 1];
        let poke = val => { stack[sp - 1] = val; };
        let getStack = n => stack[sp - n];
        let setStack = (n, val) => { stack[sp - n] = val; };

        let scopeSize = bytecode[0x17 * key[0] + key[1] & 0x1f] || 0;
        let frame = {
            locals: scopeSize ? new Array(scopeSize).fill(void 0) : EMPTY_ARRAY,
            constMap: null,
            scopeIndex: -1,
            parentScope: outerScope
        };

        if (args) {
            let paramCount = bytecode[0x20] || 0;
            for (let i = 0, n = args.length < paramCount ? args.length : paramCount; i < n; i++) {
                locals[i] = args[i];
            }
        }

        let argCount = args ? args.length : 0;
        let argsCopy = (strictMode || !hasArgs) && args ? sliceArrayLike(args) : null;
        let argumentsObj = null, argsCreated = false;
        let totalLocals = (bytecode[0x20] || 0) + (bytecode[0x21] || 0);
        let resumeStack = null, resumeSp = 0;

        setFunctionName(bytecode, func, key);
        bindFunction(func, bytecode, outerScope, key);

        const opcodeTable = [0,0,0,0,0,0xa,0xb,0,0,0,0,0,0,0x18,0,0,0,0,0,0x1e,0,0,0,0,0,0x20,0,0xf,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0xd,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x14,0,0x10,0,0,0,0,0,0,0,0x9,0,0,0,0x3,0,0,0,0x1a,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x1c,0,0,0,0,0,0,0,0x4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x1f,0,0,0,0,0,0,0,0,0,0,0,0x11,0,0,0x16,0,0xe,0x1d,0,0,0,0,0,0,0,0,0,0,0,0,0,0x1b,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x8,0x13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x1,0,0,0,0,0,0x6,0,0,0,0,0,0,0,0xc,0,0,0x17,0,0,0,0,0x12,0,0,0,0,0,0,0,0x5,0,0,0,0,0x7];

        const executeOp = (op, arg) => {
            switch (op) {
                case 0x3a:
                    if (needsSuper && !argsCreated) {
                        let superVal = getFromScope(frame);
                        if (superVal !== undefined) newTarget = superVal, argsCreated = true;
                        else throw new ReferenceError('Must call super constructor in derived class before accessing \'this\' or returning from derived constructor');
                    }
                    stack[sp++] = newTarget;
                    pc++;
                    break;
                case 0x19: {
                    let val = stack[--sp];
                    if ((typeof val === 'object' || typeof val === 'function') && val !== null) {
                        const toPrim = val[Symbol.toPrimitive];
                        if (toPrim != null) {
                            val = toPrim.call(val, 'number');
                            if (val !== null && (typeof val === 'object' || typeof val === 'function')) throw new TypeError('Cannot convert object to primitive value');
                        } else {
                            const valueOf = val.valueOf();
                            if (valueOf === null || (typeof valueOf !== 'object' && typeof valueOf !== 'function')) val = valueOf;
                            else {
                                const toString = val.toString();
                                if (toString !== null && (typeof toString === 'object' || typeof toString === 'function')) throw new TypeError('Cannot convert object to primitive value');
                                val = toString;
                            }
                        }
                    }
                    stack[sp++] = typeof val === TYPE_BIGINT ? val : +val;
                    pc++;
                    break;
                }
                case 0x16: {
                    let argc = code[arg], thisVal = stack[--sp], fn = stack[--sp];
                    if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
                    let methodMap = vmContext.methodMap, boundThis = methodMap && weakMapGet.call(methodMap, fn);
                    if (!boundThis && methodMap && (fn === functionCall || fn === functionApply)) {
                        boundThis = weakMapGet.call(methodMap, thisVal);
                    }
                    let prevThis = vmContext.currentThis;
                    if (boundThis) {
                        vmContext.isWrapped = true;
                        vmContext.currentThis = boundThis;
                    }
                    let result;
                    try {
                        if (argc === 0) result = reflectApply(fn, thisVal, EMPTY_ARRAY);
                        else if (argc === 1) {
                            let arg = stack[--sp];
                            result = arg && typeof arg === 'object' && weakSetHas.call(weakSet1, arg) ? reflectApply(fn, thisVal, arg.value) : reflectApply(fn, thisVal, [arg]);
                        } else {
                            result = reflectApply(fn, thisVal, createArrayFromStack(pop, argc));
                        }
                        stack[sp++] = result;
                    } finally {
                        if (boundThis) {
                            vmContext.isWrapped = false;
                            vmContext.currentThis = prevThis;
                        }
                    }
                    pc++;
                    break;
                }
                case 0x1d: {
                    let idx = arg & 0xffff, cidx = arg >>> 16;
                    stack[sp++] = locals[idx] + consts[cidx];
                    pc++;
                    break;
                }
                case 0x5: {
                    let val = stack[--sp], obj = stack[--sp], name = consts[arg];
                    if (obj === null || obj === undefined) throw new TypeError('Cannot set properties of ' + obj + ' (setting \'' + String(name) + '\')');
                    if (strictMode) {
                        let target = typeof obj === 'object' || typeof obj === 'function' ? obj : Object(obj);
                        if (!Reflect.set(target, name, val, obj)) throw new TypeError('Cannot set property \'' + String(name) + '\' of object');
                    } else {
                        obj[name] = val;
                    }
                    stack[sp++] = val;
                    pc++;
                    break;
                }
                case 0x33: {
                    let target = jumpTable[pc];
                    while (exceptionStack && exceptionStack.length > 0) {
                        let top = exceptionStack[exceptionStack.length - 1];
                        if (top.finallyPc !== undefined || !(target >= top.catchStart || target <= top.catchEnd)) break;
                        exceptionStack.pop();
                    }
                    if (exceptionStack && exceptionStack.length > 0) {
                        let handler = exceptionStack[exceptionStack.length - 1];
                        if (handler.finallyPc !== undefined && (target >= handler.catchStart || target <= handler.catchEnd)) {
                            pendingException = null;
                            isReturning = false;
                            returnValue = undefined;
                            isBreaking = true;
                            breakTarget = target;
                            breakScope = frame;
                            finallyStart = handler.catchEnd;
                            finallyEnd = handler.catchStart;
                            pc = handler.finallyPc;
                            break;
                        }
                    }
                    if (isReturning || isBreaking || isContinuing || pendingException !== null) {
                        if (target >= finallyEnd || target <= finallyStart) {
                            isReturning = false;
                            returnValue = undefined;
                            isBreaking = false;
                            breakTarget = 0;
                            breakScope = undefined;
                            isContinuing = false;
                            continueTarget = 0;
                            continueScope = undefined;
                            pendingException = null;
                        }
                    }
                    pc = target;
                    break;
                }
                case 0x2b:
                    stack[sp++] = vmContext.globalVars[arg];
                    pc++;
                    break;
                case 0x9: {
                    let idx = arg & 0xffff, arr = frame.locals;
                    arr[idx] = arr;
                    let nameIdx = arg >>> 16;
                    if (nameIdx) {
                        (frame.constMap || (frame.constMap = {}))[idx] = consts[nameIdx - 1];
                    }
                    pc++;
                    break;
                }
                case 0x46: {
                    let argc = stack[--sp], args = createArrayFromStack(pop, argc), ctor = stack[--sp];
                    if (typeof ctor !== 'function') throw new TypeError(ctor + ' is not a constructor');
                    if (weakSetHas.call(weakSet2, ctor)) throw new TypeError(ctor.name + ' is not a constructor');
                    let prevThis = vmContext.currentThis;
                    vmContext.currentThis = undefined;
                    let result;
                    try {
                        result = Reflect.construct(ctor, args);
                    } finally {
                        vmContext.currentThis = prevThis;
                    }
                    stack[sp++] = result;
                    pc++;
                    break;
                }
                case 0x3b: {
                    let setter = stack[--sp], name = stack[--sp], obj = stack[sp - 1], proto = getPrototype(obj);
                    defineProperty(proto, name, {set: setter, enumerable: proto === obj, configurable: true});
                    pc++;
                    break;
                }
                case 0x6: {
                    let right = stack[--sp], left = stack[--sp];
                    stack[sp++] = left != right;
                    pc++;
                    break;
                }
                case 0x2a:
                    stack[sp - 1] = ~stack[sp - 1];
                    pc++;
                    break;
                case 0x12: {
                    let prop = stack[--sp], obj = stack[--sp];
                    stack[sp++] = prop in obj;
                    pc++;
                    break;
                }
                case 0x20:
                    if (typeof stack[sp - 1] === 'symbol') throw new TypeError('Cannot convert a Symbol value to a string');
                    stack[sp - 1] = String(stack[sp - 1]);
                    pc++;
                    break;
                case 0x38: {
                    let obj = stack[--sp];
                    if (obj == null) throw new TypeError(obj + ' is not iterable');
                    let asyncIter = obj[Symbol.asyncIterator];
                    if (typeof asyncIter === 'function') {
                        stack[sp++] = asyncIter.call(obj);
                    } else {
                        let syncIter = obj[Symbol.iterator];
                        if (typeof syncIter !== 'function') throw new TypeError(obj + ' is not iterable');
                        let iter = syncIter.call(obj);
                        if (iter === null || typeof iter !== 'object') throw new TypeError('Iterator method returned a non-object value');
                        let wrap = async function(it) {
                            if (it === null || typeof it !== 'object') throw new TypeError('Iterator result is not an object');
                            let val = await it.value;
                            return {value: val, done: !!it.done};
                        };
                        let wrapper = {
                            next: function(arg) {
                                let res;
                                try { res = iter.next(arg); } catch(e) { return Promise.reject(e); }
                                return wrap(res);
                            },
                            return: function(val) {
                                if (typeof iter.return !== 'function') return Promise.resolve({value: val, done: true});
                                let res;
                                try { res = iter.return(val); } catch(e) { return Promise.reject(e); }
                                return wrap(res);
                            },
                            throw: function(err) {
                                if (typeof iter.throw !== 'function') return Promise.reject(err);
                                let res;
                                try { res = iter.throw(err); } catch(e) { return Promise.reject(e); }
                                return wrap(res);
                            },
                            [Symbol.asyncIterator]: function() { return this; }
                        };
                        stack[sp++] = wrapper;
                    }
                    pc++;
                    break;
                }
                case 0x28: {
                    let argc = stack[--sp], args = createArrayFromStack(pop, argc), superCtor = stack[--sp];
                    if (arg === 0x1) {
                        stack[sp++] = args;
                        pc++;
                        break;
                    }
                    if (vmContext.isSuperCalled) {
                        pc++;
                        break;
                    }
                    let superInfo = vmContext.superInfo;
                    if (superInfo) {
                        let superFn = superInfo.parent, proto = superFn ? setPrototypeOf(superFn) : superInfo.outer;
                        if (typeof proto !== 'function') throw new TypeError('Super expression must be a constructor');
                        let newTarget = superInfo.newTarget, instance = Reflect.construct(proto, args, newTarget);
                        if (newTarget && newTarget !== instance) {
                            getOwnPropertyNames(newTarget).forEach(k => {
                                if (!(k in instance)) instance[k] = newTarget[k];
                            });
                        }
                        newTarget = instance;
                        argsCreated = true;
                        updateScope(frame, newTarget);
                        pc++;
                        break;
                    }
                    if (typeof superCtor !== 'function') throw new TypeError('Super expression must be a constructor');
                    let derivedProto = hasBoundData(func) ? getFromScope(frame) : argsCreated ? newTarget : undefined;
                    let superProto = scope !== undefined ? scope : vmContext.newTarget;
                    vmContext.newTarget = scope;
                    let result;
                    try {
                        let callResult;
                        if (hasBoundData(superCtor)) {
                            callResult = superCtor.apply(newTarget, args);
                        } else {
                            callResult = superProto !== undefined ? Reflect.construct(superCtor, args, superProto) : Reflect.construct(superCtor, args);
                        }
                        if (callResult !== undefined && callResult !== newTarget && isObjectOrFunction(callResult)) {
                            if (newTarget) Object.assign(callResult, newTarget);
                            newTarget = callResult;
                            if (scope && scope.prototype && setPrototypeOf(newTarget) !== scope.prototype) {
                                setPrototypeSafe(newTarget, scope.prototype);
                            }
                        }
                        argsCreated = true;
                        updateScope(frame, newTarget);
                    } catch(e) {
                        let msg = e && typeof e.message === 'string' ? e.message : '';
                        if (msg.includes('call stack') || msg.includes('Illegal constructor')) {
                            let inst = Reflect.construct(superCtor, args, scope);
                            if (inst !== newTarget && newTarget) Object.assign(inst, newTarget);
                            newTarget = inst;
                            argsCreated = true;
                            updateScope(frame, newTarget);
                        } else {
                            result = e;
                        }
                    } finally {
                        delete vmContext.newTarget;
                    }
                    if (result !== undefined) throw result;
                    if (derivedProto !== undefined) throw new ReferenceError('Must call super constructor in derived class before accessing \'this\' or returning from derived constructor');
                    pc++;
                    break;
                }
                case 0x34:
                    stack[sp - 1] = +stack[sp - 1];
                    pc++;
                    break;
                case 0x1: {
                    let iter = stack[--sp], inner = iter && iter.i ? iter.i : iter;
                    if (pendingException !== null) {
                        try {
                            if (inner && typeof inner.return === 'function') {
                                stack[sp++] = Promise.resolve(inner.return()).then(() => undefined);
                            } else {
                                stack[sp++] = Promise.resolve();
                            }
                        } catch(e) {
                            stack[sp++] = Promise.resolve();
                        }
                    } else {
                        let ret = inner != null ? inner.return : undefined;
                        if (ret == null) stack[sp++] = Promise.resolve();
                        else if (typeof ret !== 'function') stack[sp++] = Promise.reject(new TypeError('iterator return is not callable'));
                        else stack[sp++] = Promise.resolve(ret.call(inner));
                    }
                    pc++;
                    break;
                }
                case 0x36:
                    stack[sp - 1] = -stack[sp - 1];
                    pc++;
                    break;
                case 0x40: {
                    let getter = stack[--sp], obj = stack[sp - 1], name = consts[arg];
                    defineProperty(obj, name, {get: getter, enumerable: false, configurable: true});
                    pc++;
                    break;
                }
                case 0x18: {
                    let val = stack[--sp], name = stack[--sp], ctor = stack[sp - 1];
                    defineProperty(ctor.prototype, name, {value: val, writable: true, enumerable: false, configurable: true});
                    if (typeof val === 'function') {
                        if (!vmContext.methodMap) vmContext.methodMap = new WeakMap();
                        weakMapSet.call(vmContext.methodMap, val, ctor.prototype);
                    }
                    pc++;
                    break;
                }
                case 0x32: {
                    let ctor = stack[--sp], val = stack[--sp];
                    stack[sp++] = val instanceof ctor;
                    pc++;
                    break;
                }
                case 0x29: {
                    let entry = exceptionTable[pc];
                    if (!exceptionStack) exceptionStack = [];
                    exceptionStack.push({
                        catchPc: entry[0] >= 0 ? entry[0] : undefined,
                        finallyPc: entry[1] >= 0 ? entry[1] : undefined,
                        catchStart: entry[2] >= 0 ? entry[2] : undefined,
                        stackDepth: sp,
                        catchEnd: pc,
                        scope: frame
                    });
                    pc++;
                    break;
                }
                case 0x11: {
                    let val = stack[--sp], name = stack[--sp], obj = stack[sp - 1];
                    defineProperty(obj, name, {value: val, writable: true, enumerable: false, configurable: true});
                    if (typeof val === 'function') {
                        if (!vmContext.methodMap) vmContext.methodMap = new WeakMap();
                        weakMapSet.call(vmContext.methodMap, val, obj);
                    }
                    pc++;
                    break;
                }
                case 0x14: {
                    let local = locals[arg], iterVal = local && local.iter;
                    if (iterVal !== undefined) {
                        let idx = local.idx;
                        if (idx >= iterVal.length) {
                            pc = jumpTable[pc];
                        } else {
                            local.idx = idx +
