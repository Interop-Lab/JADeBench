'use strict';
function _slicedToArray(r, e)
    /*Scope Closed:false | writes:false*/
    {
        return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
    }
function _nonIterableRest()
    /*Scope Closed:true*/
    {
        throw new TypeError('Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
    }
function _unsupportedIterableToArray(r, a)
    /*Scope Closed:false | writes:false*/
    {
        if (r) {
            if (typeof r == 'string') {
                return _arrayLikeToArray(r, a);
            }
            var t = {}.toString.call(r).slice(8, -1);
            if (t === 'Object' && r.constructor) {
                t = r.constructor.name;
            }
            {
                return undefined;
            }
        }
    }
function _arrayLikeToArray(r, a)
    /*Scope Closed:true*/
    {
        if (a == null || a > r.length) {
            a = r.length;
        }
        for (var e = 0, n = Array(a); e < a; e++) {
            n[e] = r[e];
        }
        return n;
    }
function _iterableToArrayLimit(r, l)
    /*Scope Closed:false | writes:false*/
    {
        var t = r == null ? null : typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'];
        if (t != null) {
            var e;
            var n;
            var i;
            var u;
            var a = [];
            var f = true;
            var o = false;
            try {
                i = (t = t.call(r)).next;
                if (l === 0) {
                    if (Object(t) !== t) {
                        return;
                    }
                    f = false;
                } else {
                    for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) {
                    }
                }
            } catch (r) {
                o = true;
                n = r;
            } finally {
                try {
                    if (true && t.return != null && (u = t.return(), Object(u) !== u)) {
                        return;
                    }
                } finally {
                    if (o) {
                        throw n;
                    }
                }
            }
            return a;
        }
    }
function _arrayWithHoles(r)
    /*Scope Closed:true*/
    {
        if (Array.isArray(r)) {
            return r;
        }
    }
var path = require('path');
var fs = require('fs');
var os = require('os');
var DEFAULT_BASE_ROOT = path.join(os.homedir(), '.opencontext');
var BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT;
var CONFIG_PATH = path.join(BASE_ROOT, 'config.json');
var CONFIG_KEYS = {
    EMBEDDING_API_KEY: {
        description: 'API Key for embedding generation (OpenAI, DashScope, etc.)',
        sensitive: true,
        envVar: 'EMBEDDING_API_KEY',
        fallbackEnvVar: 'OPENAI_API_KEY'
    },
    EMBEDDING_API_BASE: {
        description: 'API Base URL for embedding service',
        sensitive: false,
        envVar: 'EMBEDDING_API_BASE',
        fallbackEnvVar: 'OPENAI_BASE_URL',
        default: 'https://api.openai.com/v1'
    },
    EMBEDDING_MODEL: {
        description: 'Embedding model name',
        sensitive: false,
        envVar: 'EMBEDDING_MODEL',
        default: 'text-embedding-3-small'
    },
    AI_PROVIDER: {
        description: 'AI provider: openai | ollama',
        sensitive: false,
        envVar: 'AI_PROVIDER',
        default: 'openai'
    },
    AI_API_KEY: {
        description: 'API Key for AI chat (OpenAI compatible)',
        sensitive: true,
        envVar: 'AI_API_KEY',
        fallbackEnvVar: 'OPENAI_API_KEY'
    },
    AI_API_BASE: {
        description: 'API Base URL for AI chat service',
        sensitive: false,
        envVar: 'AI_API_BASE',
        default: 'https://api.openai.com/v1'
    },
    AI_MODEL: {
        description: 'AI chat model name',
        sensitive: false,
        envVar: 'AI_MODEL',
        default: 'gpt-4o'
    },
    AI_PROMPT: {
        description: 'Custom system prompt for AI reflections',
        sensitive: false,
        envVar: 'AI_PROMPT',
        default: 'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful. Respond in the same language as the user.'
    }
};
function ensureConfigDir()
    /*Scope Closed:false | writes:false*/
    {
        if (!fs.existsSync(BASE_ROOT)) {
            fs.mkdirSync(BASE_ROOT, { recursive: true });
        }
    }
function loadConfig()
    /*Scope Closed:false | writes:false*/
    {
        ensureConfigDir();
        if (!fs.existsSync(CONFIG_PATH)) {
            return {};
        }
        try {
            var _0x12f622 = fs.readFileSync(CONFIG_PATH, 'utf-8');
            return JSON.parse(_0x12f622);
        } catch (_0x29b65b) {
            console.error('Warning: Failed to parse config file: ' + _0x29b65b.message);
            return {};
        }
    }
function saveConfig(_0xe3a8fe)
    /*Scope Closed:false | writes:false*/
    {
        ensureConfigDir();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(_0xe3a8fe, null, 2), 'utf-8');
    }
function get(_0x43d133)
    /*Scope Closed:false | writes:false*/
    {
        var _0x35b985 = undefined;
        if ((undefined != null ? undefined : _0x35b985.envVar) && process.env[undefined.envVar]) {
            return process.env[_0x35b985.envVar];
        }
        if ((undefined != null ? undefined : _0x35b985.fallbackEnvVar) && process.env[undefined.fallbackEnvVar]) {
            return process.env[_0x35b985.fallbackEnvVar];
        }
        var _0x1f2d4c = loadConfig();
        if (_0x1f2d4c[_0x43d133] !== undefined) {
            return _0x1f2d4c[_0x43d133];
        }
        if (_0x43d133 === 'EMBEDDING_API_KEY' && _0x1f2d4c.OPENAI_API_KEY !== undefined) {
            return _0x1f2d4c.OPENAI_API_KEY;
        }
        if (_0x43d133 === 'EMBEDDING_API_BASE' && _0x1f2d4c.OPENAI_BASE_URL !== undefined) {
            return _0x1f2d4c.OPENAI_BASE_URL;
        }
        if (undefined != null) {
            return undefined;
        } else {
            return _0x35b985.default;
        }
    }
function set(_0x13b453, _0x17e605)
    /*Scope Closed:false | writes:true*/
    {
        if (!CONFIG_KEYS[_0x13b453]) {
            throw new Error('Unknown config key: ' + _0x13b453 + '. Run "oc config list" to see available keys.');
        }
        var _0x38a53e = loadConfig();
        _0x38a53e[_0x13b453] = _0x17e605;
        saveConfig(_0x38a53e);
    }
function unset(_0x5d765c)
    /*Scope Closed:false | writes:false*/
    {
        var _0x4eadbd = loadConfig();
        saveConfig(_0x4eadbd);
    }
function list(_0x52602e = false)
    /*Scope Closed:false | writes:false*/
    {
        var _0x55b349 = loadConfig();
        var _0x352b34 = [];
        for (var _i = 0, _Object$entries = Object.entries(CONFIG_KEYS); _i < _Object$entries.length; _i++) {
            var _Object$entries$_i = _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
            var _0x1843a8 = _Object$entries$_i[0];
            var _0x5a40b5 = _Object$entries$_i[1];
            var _0x540dcb = null;
            var _0x135ea2 = 'default';
            if (_0x5a40b5.envVar && process.env[_0x5a40b5.envVar]) {
                _0x540dcb = process.env[_0x5a40b5.envVar];
                _0x135ea2 = 'env';
            } else if (_0x5a40b5.fallbackEnvVar && process.env[_0x5a40b5.fallbackEnvVar]) {
                _0x540dcb = process.env[_0x5a40b5.fallbackEnvVar];
                _0x135ea2 = 'env (legacy)';
            } else if (_0x55b349[_0x1843a8] !== undefined) {
                _0x540dcb = _0x55b349[_0x1843a8];
                _0x135ea2 = 'config';
            } else if (_0x5a40b5.default) {
                _0x540dcb = _0x5a40b5.default;
                _0x135ea2 = 'default';
            }
            var _0x47b750 = _0x540dcb;
            if (_0x540dcb && _0x5a40b5.sensitive && _0x52602e) {
                _0x47b750 = maskSensitive(_0x540dcb);
            } else if (_0x540dcb && _0x5a40b5.sensitive) {
                _0x47b750 = '********';
            }
            _0x352b34.push({
                key: _0x1843a8,
                value: _0x47b750,
                source: _0x135ea2,
                description: _0x5a40b5.description,
                isSet: _0x540dcb !== null && _0x540dcb !== undefined
            });
        }
        return _0x352b34;
    }
function maskSensitive(_0x455a7d)
    /*Scope Closed:true*/
    {
        if (!_0x455a7d || _0x455a7d.length < 8) {
            return '********';
        }
        var _0x171cc7 = _0x455a7d.substring(0, 4);
        var _0x3b1c9f = _0x455a7d.substring(_0x455a7d.length - 4);
        return _0x455a7d.substring(0, 4) + '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + _0x455a7d.substring(_0x455a7d.length - 4);
    }
function getConfigPath()
    /*Scope Closed:false | writes:false*/
    {
        return CONFIG_PATH;
    }
function getAvailableKeys()
    /*Scope Closed:false | writes:false*/
    {
        return Object.keys(CONFIG_KEYS);
    }
var _0x152b44 = {
    get: get,
    set: set,
    unset: unset,
    list: list,
    loadConfig: loadConfig,
    saveConfig: saveConfig,
    getConfigPath: getConfigPath,
    getAvailableKeys: getAvailableKeys,
    CONFIG_KEYS: CONFIG_KEYS,
    BASE_ROOT: BASE_ROOT
};
module.exports = _0x152b44;