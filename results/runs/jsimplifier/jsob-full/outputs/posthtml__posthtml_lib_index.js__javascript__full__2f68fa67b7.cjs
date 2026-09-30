'use strict';
function _classCallCheck(a, n)
    /*Scope Closed:true*/
    {
        if (!(a instanceof n)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
function _defineProperties(e, r)
    /*Scope Closed:true*/
    {
        for (var t = 0; t < r.length; t++) {
            var o = r[t];
            o.enumerable = o.enumerable || false;
            o.configurable = true;
            if ('value' in o) {
                o.writable = true;
            }
            Object.defineProperty(e, _toPropertyKey(o.key), o);
        }
    }
function _createClass(e, r, t)
    /*Scope Closed:false | writes:false*/
    {
        if (r) {
            _defineProperties(e.prototype, r);
        }
        if (t) {
            _defineProperties(e, t);
        }
        Object.defineProperty(e, 'prototype', { writable: false });
        return e;
    }
function _toPropertyKey(t)
    /*Scope Closed:false | writes:false*/
    {
        var i = _toPrimitive(t, 'string');
        if (_typeof(i) == 'symbol') {
            return i;
        } else {
            return i + '';
        }
    }
function _toPrimitive(t, r)
    /*Scope Closed:false | writes:false*/
    {
        if (_typeof(t) != 'object' || !t) {
            return t;
        }
        var e = t[Symbol.toPrimitive];
        if (e !== undefined) {
            var i = e.call(t, r || 'default');
            if (_typeof(i) != 'object') {
                return i;
            }
            throw new TypeError('@@toPrimitive must return a primitive value.');
        }
        return (r === 'string' ? String : Number)(t);
    }
function _typeof(o)
    /*Scope Closed:false | writes:false*/
    {
        '@babel/helpers - typeof';
        if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
            var _typeof_new = function _typeof(o)
                /* Called:undefined | Scope Closed:true*/
                {
                    return typeof o;
                };
        } else {
            var _typeof_new = function _typeof(o)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    if (o && typeof Symbol == 'function' && o.constructor === Symbol && o !== Symbol.prototype) {
                        return 'symbol';
                    } else {
                        return typeof o;
                    }
                };
        }
        return _typeof(o);
    }
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x393aec, _0x232eee)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x274660()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x232eee) {
                    _0x393aec[Object.getOwnPropertyNames(_0x393aec)[0]]((_0x232eee = { exports: {} }).exports, _0x232eee);
                }
                return _0x232eee.exports;
            };
    };
var _0x338b93 = {
    '../work/posthtml__posthtml/package_.json'(_0x304469, _0x5cb8ac)
        /* Called:undefined | Scope Closed:true*/
        {
            var _0x39b5c5 = {
                name: 'posthtml',
                version: '0.16.7',
                description: 'HTML/XML processor',
                keywords: [
                    'html',
                    'xml',
                    'postproccessor',
                    'parser',
                    'transform',
                    'transformations',
                    'manipulation',
                    'preprocessor',
                    'processor'
                ],
                main: 'lib',
                types: 'types/posthtml.d.ts',
                files: [
                    'types',
                    'lib'
                ],
                engines: {},
                dependencies: {},
                devDependencies: {},
                scripts: {},
                author: 'Ivan Voischev <voischev.ivan@ya.ru>',
                contributors: [
                    {
                        name: 'Ivan Voischev',
                        email: 'voischev.ivan@ya.ru'
                    },
                    {
                        name: 'Ivan Demidov',
                        email: 'scrum@list.ru'
                    }
                ],
                homepage: 'https://github.com/posthtml/posthtml',
                repository: 'https://github.com/posthtml/posthtml.git',
                bugs: 'https://github.com/posthtml/posthtml/issues',
                license: 'MIT'
            };
            _0x39b5c5.engines.node = '>=12.0.0';
            _0x39b5c5.dependencies['posthtml-parser'] = '^0.11.0';
            _0x39b5c5.dependencies['posthtml-render'] = '^3.0.0';
            _0x39b5c5.devDependencies['@commitlint/cli'] = '^16.2.1';
            _0x39b5c5.devDependencies['@commitlint/config-angular'] = '^16.2.1';
            _0x39b5c5.devDependencies.c8 = '^7.7.3';
            _0x39b5c5.devDependencies.chai = '^4.3.4';
            _0x39b5c5.devDependencies['chai-as-promised'] = '^7.1.1';
            _0x39b5c5.devDependencies['chai-subset'] = '^1.6.0';
            _0x39b5c5.devDependencies['conventional-changelog-cli'] = '^2.1.1';
            _0x39b5c5.devDependencies.husky = '^7.0.1';
            _0x39b5c5.devDependencies['jsdoc-to-markdown'] = '^7.0.1';
            _0x39b5c5.devDependencies['lint-staged'] = '^12.3.4';
            _0x39b5c5.devDependencies.mocha = '^9.0.3';
            _0x39b5c5.devDependencies.standard = '^16.0.2';
            _0x39b5c5.scripts.prepare = 'husky install';
            _0x39b5c5.scripts.version = 'conventional-changelog -i changelog.md -s -r 0 && git add changelog.md';
            _0x39b5c5.scripts.test = 'c8 mocha';
            _0x39b5c5.scripts['docs:api'] = 'jsdoc2md lib/api.js > docs/api.md';
            _0x39b5c5.scripts['docs:core'] = 'jsdoc2md lib/index.js > docs/core.md';
            _0x5cb8ac.exports = _0x39b5c5;
        }
};
var require_package = function _0x274660()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x232eee) {
            _0x393aec[Object.getOwnPropertyNames(_0x393aec)[0]]((_0x232eee = { exports: {} }).exports, _0x232eee);
        }
        return _0x232eee.exports;
    };
var require_api = function _0x274660()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x232eee) {
            _0x393aec[Object.getOwnPropertyNames(_0x393aec)[0]]((_0x232eee = { exports: {} }).exports, _0x232eee);
        }
        return _0x232eee.exports;
    };
var pkg = require_package();
var Api = require_api();
var _require = require('posthtml-parser');
var parser = _require.parser;
var _require2 = require('posthtml-render');
var render = _require2.render;
var PostHTML = /*@Info: Executed but got error: ReferenceError: require is not defined*/
function ()
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function PostHTML(_0x19c6ec)
            /*Scope Closed:false | writes:false*/
            {
                _classCallCheck(this, PostHTML);
                this.version = pkg.version;
                this.name = pkg.name;
                if (typeof _0x19c6ec === 'function') {
                    this.plugins = [_0x19c6ec];
                } else {
                    this.plugins = _0x19c6ec || [];
                }
                this.source = '';
                this.messages = [];
                this.parser = parser;
                this.render = render;
                Api.call(this);
            }
        return _createClass(PostHTML, [
            {
                key: 'use',
                value() {
                    var _this$plugins;
                    (_this$plugins = this.plugins).push.apply(_this$plugins, arguments);
                    return this;
                }
            },
            {
                key: 'process',
                value(_0x28290f) {
                    var _this = this;
                    var _0x184988 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    this.options = _0x184988;
                    this.source = _0x28290f;
                    if (_0x184988.parser) {
                        parser = this.parser = _0x184988.parser;
                    }
                    if (_0x184988.render) {
                        render = this.render = _0x184988.render;
                    }
                    if (_0x184988.skipParse) {
                        _0x28290f = _0x28290f || [];
                    } else {
                        _0x28290f = parser_new(_0x28290f, _0x184988);
                    }
                    _0x28290f = [].concat(_0x28290f);
                    if (_0x184988.sync === true) {
                        this.plugins.forEach(function (_0x463840, _0x1c7fed) {
                            _treeExtendApi(_0x28290f, _this);
                            var _0x59771e;
                            if (_0x463840.length === 2 || isPromise(_0x59771e = _0x463840(_0x28290f))) {
                                throw new Error('Can\u2019t process contents in sync mode because of async plugin: ' + _0x463840.name);
                            }
                            if (_0x1c7fed !== _this.plugins.length - 1 && !_0x184988.skipParse) {
                                _0x28290f = [].concat(_0x28290f);
                            }
                            _0x28290f = _0x59771e || _0x28290f;
                        });
                        return lazyResult(render, _0x28290f);
                    }
                    var _0x5a56cb = 0;
                    var _0x731afc2 = function _0x731afc(_0x7d48e8, _0xc7928c) {
                        _treeExtendApi(_0x7d48e8, _this);
                        if (_this.plugins.length <= _0x5a56cb) {
                            _0xc7928c(null, _0x7d48e8);
                            return;
                        }
                        function _0x4842eb(_0x2c8a4d) {
                            if (_0x2c8a4d && !_0x184988.skipParse) {
                                _0x2c8a4d = [].concat(_0x2c8a4d);
                            }
                            return _0x731afc2(_0x2c8a4d || _0x7d48e8, _0xc7928c);
                        }
                        var _0x505ff9 = _this.plugins[_0x5a56cb++];
                        if (_0x505ff9.length === 2) {
                            _0x505ff9_new(_0x7d48e8, function (_0x229b7f, _0x868218) {
                                if (_0x229b7f) {
                                    return _0xc7928c(_0x229b7f);
                                }
                                _0x4842eb(_0x868218);
                            });
                            return;
                        }
                        var _0xdf07ad = null;
                        var _0xda8539 = tryCatch(function () {
                            return _0x505ff9_new(_0x7d48e8);
                        }, function (_0x36a544) {
                            _0xdf07ad = _0x36a544;
                            return _0x36a544;
                        });
                        if (_0xdf07ad) {
                            _0xc7928c(_0xdf07ad);
                            return;
                        }
                        if (isPromise(_0xda8539)) {
                            _0xda8539.then(_0x4842eb).catch(_0xc7928c);
                            return;
                        }
                        _0x4842eb(_0xda8539);
                    };
                    return new Promise(function (_0x541b54, _0x281fe2) {
                        _0x731afc2(_0x28290f, function (_0x17d9f2, _0x439491) {
                            if (_0x17d9f2) {
                                _0x281fe2(_0x17d9f2);
                            } else {
                                _0x541b54(lazyResult(render, _0x439491));
                            }
                        });
                    });
                }
            }
        ]);
    }();
module.exports = function (_0x974284)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return new PostHTML(_0x974284);
    };
function _treeExtendApi(_0x4078c3, _0x35ed7d)
    /*Scope Closed:false | writes:false*/
    {
        if (_typeof(_0x4078c3) === 'object') {
            _0x4078c3 = Object.assign(_0x4078c3, _0x35ed7d);
        }
    }
function isPromise(_0x32f7f5)
    /*Scope Closed:true*/
    {
        return !!_0x32f7f5 && typeof _0x32f7f5.then === 'function';
    }
function tryCatch(_0xcfa8d1, _0x124174)
    /*Scope Closed:false | writes:false*/
    {
        try {
            return _0xcfa8d1();
        } catch (_0xa41acc) {
            _0x124174(_0xa41acc);
        }
    }
function lazyResult(_0x5e83cb, _0x16cb54)
    /*Scope Closed:true*/
    {
        return {
            html: function ()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return _0x5e83cb(_0x16cb54, _0x16cb54.options);
                },
            tree: _0x16cb54,
            messages: _0x16cb54.messages
        };
    }