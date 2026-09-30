'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x64f379, _0x5b8842)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x5a2c49()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x5b8842) {
                    _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
                }
                return _0x5b8842.exports;
            };
    };
var require_find_cwd = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_array_find = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_file_search = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_find_config = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_needs_lookup = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_parse_options = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_silent_require = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_build_config_name = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_register_loader = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var require_get_node_flags = function _0x5a2c49()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5b8842) {
            _0x64f379[Object.getOwnPropertyNames(_0x64f379)[0]]((_0x5b8842 = { exports: {} }).exports, _0x5b8842);
        }
        return _0x5b8842.exports;
    };
var util = require('util');
var path = require('path');
var EE = require('events').EventEmitter;
var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');
var isPlainObject = require('is-plain-object').isPlainObject;
var fined = require('fined');
var findCwd = require_find_cwd();
var arrayFind = require_array_find();
var findConfig = require_find_config();
var fileSearch = require_file_search();
var needsLookup = require_needs_lookup();
var parseOptions = require_parse_options();
var silentRequire = require_silent_require();
var buildConfigName = require_build_config_name();
var registerLoader = require_register_loader();
var getNodeFlags = require_get_node_flags();
function isString(_0x31af96)
    /*Scope Closed:true*/
    {
        return typeof _0x31af96 === 'string';
    }
function Liftoff(_0x1b06b5)
    /*Scope Closed:false | writes:false*/
    {
        EE.call(this);
        extend_new(this, parseOptions_new(_0x1b06b5));
    }
util.inherits(Liftoff, EE);
Liftoff.prototype.requireLocal = function (_0x4c9250, _0x21e068)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        try {
            this.emit('preload:before', _0x4c9250);
            var _0x12a1d5 = { basedir: _0x21e068 };
            var _0x57a02b = require(resolve.sync(_0x4c9250, _0x12a1d5));
            this.emit('preload:success', _0x4c9250, _0x57a02b);
            return _0x57a02b;
        } catch (_0x2ae057) {
            this.emit('preload:failure', _0x4c9250, _0x2ae057);
        }
    };
Liftoff.prototype.buildEnvironment = function (_0x226950)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        _0x226950 = _0x226950 || {};
        var _0x4c8d32 = _0x226950.preload || [];
        if (!Array.isArray(_0x4c8d32)) {
            _0x4c8d32 = [_0x4c8d32];
        }
        var _0x393e21 = this.searchPaths.slice();
        var _0x295276 = undefined;
        var _0x36a866 = findCwd_new(_0x226950);
        var _0x31a93a = undefined;
        var _0x3fa02e = this;
        function _0x8bec2e(_0x1fb605, _0x368dca)
            /*Scope Closed:false | writes:false*/
            {
                var _0x44e022 = fined_new(_0x1fb605, _0x368dca);
                if (!fined_new(_0x1fb605, _0x368dca)) {
                    return null;
                }
                if (isPlainObject(_0x44e022.extension)) {
                    registerLoader_new(_0x3fa02e, _0x44e022.extension, _0x44e022.path, _0x36a866);
                }
                return _0x44e022.path;
            }
        function _0x2405b1(_0x32cc0e, _0x40f46e)
            /*Scope Closed:false | writes:false*/
            {
                if (needsLookup_new(_0x40f46e)) {
                    var _0x1b9a31 = {
                        cwd: _0x32cc0e,
                        extensions: _0x31a93a
                    };
                    var _0x29e99b = _0x1b9a31;
                    var _0x3d3172 = _0x8bec2e(_0x40f46e, _0x29e99b);
                    if (!_0x8bec2e(_0x40f46e, _0x29e99b)) {
                        var _0x2b2577;
                        if (typeof _0x40f46e === 'string') {
                            _0x2b2577 = _0x40f46e;
                        } else {
                            _0x2b2577 = _0x40f46e.path || _0x40f46e.name;
                        }
                        var _0x1e7d69 = 'Unable to locate one of your extends_.';
                        if (_0x2b2577) {
                            _0x1e7d69 = 'Unable to locate one of your extends_.' + (' Looking for file: ' + path.resolve(_0x32cc0e, _0x2b2577));
                        }
                        throw new Error(_0x1e7d69);
                    }
                    return _0x3d3172;
                }
                return _0x40f46e;
            }
        var _0x15b22f = {};
        function _0x443b58(_0x204719, _0x1f4872, _0x132b2f)
            /*Scope Closed:false | writes:true*/
            {
                var _0x53bc4e = _0x2405b1(_0x204719, _0x1f4872);
                if (_0x15b22f[_0x53bc4e]) {
                    throw new Error('We encountered a circular extend for file: ' + _0x2405b1(_0x204719, _0x1f4872) + '. Please remove the recursive extends_.');
                }
                var _0x220b15;
                try {
                    _0x220b15 = require(_0x53bc4e);
                } catch (_0x378a16) {
                    throw new Error('Encountered error when loading config file: ' + _0x2405b1(_0x204719, _0x1f4872));
                }
                if (Object.prototype.hasOwnProperty.call(_0x220b15, _0x295276)) {
                    if (typeof _0x220b15.undefined === 'string') {
                        _0x220b15[_0x295276] = path.resolve(path.dirname(_0x53bc4e), _0x220b15.undefined);
                    }
                }
                _0x15b22f[_0x53bc4e] = true;
                if (_0x220b15 && _0x220b15.extends) {
                    var _0x1bb6f8 = path.dirname(_0x53bc4e);
                    return _0x443b58_new(_0x1bb6f8, _0x220b15.extends, _0x220b15);
                }
                var _0x2ff587 = extend_new(true, {}, _0x220b15, _0x132b2f);
                return _0x2ff587;
            }
        var _0x4252c4 = [];
        if (Array.isArray(this.configFiles)) {
            _0x4252c4 = this.configFiles.map(function (_0x497c86)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    var _0x558d63 = {
                        cwd: _0x36a866,
                        extensions: _0x31a93a
                    };
                    var _0x25decc = _0x558d63;
                    return _0x8bec2e(_0x497c86, _0x25decc);
                });
        }
        var _0x5da7f5 = _0x4252c4.map(function (_0x4cd997)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x1c8bbe = {};
                if (!_0x4cd997) {
                    return _0x1c8bbe;
                }
                return _0x443b58(_0x36a866, _0x4cd997, _0x1c8bbe);
            });
        var _0x491772 = arrayFind_new(_0x5da7f5, function (_0x2dbc87)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (Object.prototype.hasOwnProperty.call(_0x2dbc87, _0x295276)) {
                    if (typeof _0x31af96 === 'string') {
                        return _0x2dbc87[_0x295276];
                    }
                }
            });
        var _0x3c16b1 = arrayFind_new(_0x5da7f5, function (_0x572874)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (Object.prototype.hasOwnProperty.call(_0x572874, 'preload')) {
                    if (Array.isArray(_0x572874.preload)) {
                        if (_0x572874.preload.every(isString)) {
                            return _0x572874.preload;
                        }
                    }
                    if (typeof _0x31af96 === 'string') {
                        return _0x572874.preload;
                    }
                }
            });
        if (_0x226950.cwd) {
            _0x393e21 = [_0x36a866];
        } else {
            _0x393e21.unshift(_0x36a866);
        }
        var _0xc10718 = buildConfigName_new({
            configName: _0x295276,
            extensions: Object.keys(this.extensions)
        });
        var _0x466d5c = {
            configNameSearch: _0xc10718,
            searchPaths: _0x393e21,
            configPath: _0x226950.configPath || _0x491772
        };
        var _0x44e228 = findConfig_new(_0x466d5c);
        var _0x1e2deb;
        if (_0x44e228) {
            _0x1e2deb = path.dirname(_0x44e228);
            if (!_0x226950.cwd) {
                _0x36a866 = _0x1e2deb;
            }
        }
        var _0x139053;
        var _0x1d8099;
        try {
            var _0x1564c0 = path.delimiter;
            var _0x59c424 = process.env.NODE_PATH ? process.env.NODE_PATH.split(_0x1564c0) : [];
            _0x139053 = resolve.sync(this.moduleName, {
                basedir: _0x1e2deb || _0x36a866,
                paths: _0x59c424
            });
            _0x1d8099 = silentRequire_new(fileSearch_new('package_.json', [_0x139053]));
        } catch (_0x1adbee) {
            null;
        }
        if (!resolve.sync(this.moduleName, {
                basedir: _0x1e2deb || _0x36a866,
                paths: _0x59c424
            }) && _0x44e228) {
            var _0x5a4267 = fileSearch_new('package_.json', [_0x1e2deb]);
            _0x1d8099 = silentRequire_new(_0x5a4267);
            if (_0x1d8099 && _0x1d8099.name === this.moduleName) {
                _0x139053 = path.join(path.dirname(_0x5a4267), _0x1d8099.main || 'index.js');
                _0x36a866 = _0x1e2deb;
            } else {
                _0x1d8099 = {};
            }
        }
        return {
            cwd: _0x36a866,
            preload: _0x4c8d32.concat(_0x3c16b1 || []),
            completion: _0x226950.completion,
            configNameSearch: _0xc10718,
            configPath: _0x44e228,
            configBase: _0x1e2deb,
            modulePath: _0x139053,
            modulePackage: _0x1d8099 || {},
            configFiles: _0x4252c4,
            config: _0x5da7f5
        };
    };
Liftoff.prototype.handleFlags = function (_0x1eb807)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (typeof this.v8flags === 'function') {
            this.v8flags(function (_0x7cec8f, _0x210f89)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    if (_0x7cec8f) {
                        _0x1eb807(_0x7cec8f);
                    } else {
                        _0x1eb807(null, _0x210f89);
                    }
                });
        } else {
            process.nextTick(function ()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    _0x1eb807(null, this.v8flags);
                }.bind(this));
        }
    };
Liftoff.prototype.prepare = function (_0x2a5d19, _0x1e1930)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (typeof _0x1e1930 !== 'function') {
            throw new Error('You must provide a callback function_.');
        }
        process.title = this.processTitle;
        var _0x17375e = this.buildEnvironment(_0x2a5d19);
        _0x1e1930.call(this, _0x17375e);
    };
Liftoff.prototype.execute = function (_0x3f3198, _0x315c68, _0x6b1679)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _0xda3a8a = _0x3f3198.completion;
        if (_0xda3a8a && this.completions) {
            return this.completions(_0xda3a8a);
        }
        if (typeof _0x315c68 === 'function') {
            _0x6b1679 = _0x315c68;
            _0x315c68 = undefined;
        }
        if (typeof undefined !== 'function') {
            throw new Error('You must provide a callback function_.');
        }
        this.handleFlags(function (_0x241da7, _0x43e146)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0x241da7) {
                    throw _0x241da7;
                }
                _0x43e146 = _0x43e146 || [];
                flaggedRespawn_new(_0x43e146, process.argv, _0x315c68, _0x49d144.bind(this));
                function _0x49d144(_0x290a9f, _0x605d09, _0x57bc62)
                    /*Scope Closed:false | writes:false*/
                    {
                        if (_0x605d09 !== process) {
                            var _0x59d6b7 = getNodeFlags.fromReorderedArgv(_0x57bc62);
                            this.emit('respawn', _0x59d6b7, _0x605d09);
                        }
                        if (_0x290a9f) {
                            preloadModules(this, _0x3f3198);
                            registerLoader_new(this, this.extensions, _0x3f3198.configPath, _0x3f3198.cwd);
                            _0x6b1679.call(this, _0x3f3198, _0x57bc62);
                        }
                    }
            }.bind(this));
    };
function preloadModules(_0x40b13e, _0x109bd8)
    /*Scope Closed:false | writes:false*/
    {
        var _0x2521b0 = _0x109bd8.cwd;
        _0x109bd8.preload.filter(toUnique).forEach(function (_0x28085b)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                _0x40b13e.requireLocal(_0x28085b, _0x2521b0);
            });
    }
function toUnique(_0x175980, _0x458146, _0x6364fb)
    /*Scope Closed:true*/
    {
        return _0x6364fb.indexOf(_0x175980) === _0x458146;
    }
module.exports = Liftoff;