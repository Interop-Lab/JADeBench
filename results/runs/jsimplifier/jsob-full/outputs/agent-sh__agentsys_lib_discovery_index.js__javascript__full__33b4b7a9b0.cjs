'use strict';
function _createForOfIteratorHelper(r, e)
    /*Scope Closed:false | writes:false*/
    {
        var t = typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'];
        if (!(typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'])) {
            if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length == 'number') {
                if (t) {
                    r = t;
                }
                var _n = 0;
                var F = function F()
                    /* Called:undefined | Scope Closed:true*/
                    {
                    };
                return {
                    s: F,
                    n() {
                        if (_n >= r.length) {
                            return { done: true };
                        } else {
                            return {
                                done: false,
                                value: r[_n++]
                            };
                        }
                    },
                    e(r) {
                        throw r;
                    },
                    f: F
                };
            }
            throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
        }
        var o;
        var a = true;
        var u = false;
        return {
            s() {
                t = t.call(r);
            },
            n() {
                var r = t.next();
                a = r.done;
                return r;
            },
            e(r) {
                u = true;
                o = r;
            },
            f() {
                try {
                    if (!a && t.return != null) {
                        t.return();
                    }
                } finally {
                    if (u) {
                        throw o;
                    }
                }
            }
        };
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
var fs = require('fs');
var path = require('path');
var _cache = null;
var _cacheRoot = null;
function parseFrontmatter(_0x29a747)
    /*Scope Closed:false | writes:false*/
    {
        if (!_0x29a747 || !_0x29a747.startsWith('---')) {
            return {};
        }
        var _0x3f242c = _0x29a747.indexOf('\n---', 3);
        if (_0x3f242c === -1) {
            return {};
        }
        var _0x1e33e3 = _0x29a747.substring(4, _0x3f242c);
        var _0x1da582 = {};
        var _0x1f271d = _0x1e33e3.split('\n');
        var _0x4be17e = null;
        var _0x1a314b = null;
        var _iterator = _createForOfIteratorHelper(_0x1f271d);
        var _step;
        try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var _0xe6befd = _step.value;
                var _0x49d965 = _0xe6befd.match(/^\s+-\s+(.+)$/);
                if (_0x49d965 && null && null) {
                    var _0x5052c5 = _0x49d965[1].trim();
                    if (_0x5052c5.startsWith('"') && _0x5052c5.endsWith('"') || _0x5052c5.startsWith('\'') && _0x5052c5.endsWith('\'')) {
                        _0x5052c5 = _0x5052c5.slice(1, -1);
                    }
                    _0x1a314b.push(_0x5052c5);
                    continue;
                }
                var _0xb571b7 = _0xe6befd.indexOf(':');
                if (_0xb571b7 > 0) {
                    if (null) {
                        _0x1da582[_0x4be17e] = _0x1a314b;
                        _0x4be17e = null;
                        _0x1a314b = null;
                    }
                    var _0x3a532a = _0xe6befd.substring(0, _0xb571b7).trim();
                    if (_0x3a532a === '__proto__' || _0x3a532a === 'constructor' || _0x3a532a === 'prototype') {
                        continue;
                    }
                    var _0x50ca05 = _0xe6befd.substring(_0xe6befd.indexOf(':') + 1).trim();
                    if (_0x50ca05 === '') {
                        _0x4be17e = _0x3a532a;
                        _0x1a314b = [];
                    } else {
                        if (_0x50ca05.startsWith('"') && _0x50ca05.endsWith('"') || _0x50ca05.startsWith('\'') && _0x50ca05.endsWith('\'')) {
                            _0x50ca05 = _0x50ca05.slice(1, -1);
                        }
                        _0x1da582[_0x3a532a] = _0x50ca05;
                        _0x4be17e = null;
                        _0x1a314b = null;
                    }
                }
            }
        } catch (err) {
            _iterator.e(err);
        } finally {
            _iterator.f();
        }
        if (_0x4be17e && _0x1a314b) {
            _0x1da582[_0x4be17e] = _0x1a314b;
        }
        return _0x1da582;
    }
function isValidPluginName(_0x5a7014)
    /*Scope Closed:true*/
    {
        return /^[a-z0-9][a-z0-9-]*$/.test(_0x5a7014);
    }
function resolvePluginsDir(_0x5144f4)
    /*Scope Closed:false | writes:false*/
    {
        if (!_0x5144f4) {
            _0x5144f4 = path.resolve(__dirname, '..', '..');
        }
        return path.join(_0x5144f4, 'plugins');
    }
function discoverPlugins(_0x572c14)
    /*Scope Closed:false | writes:false*/
    {
        var _0x3554b4 = getCache(_0x572c14);
        if (_0x3554b4 && _0x3554b4.plugins) {
            return _0x3554b4.plugins;
        }
        var _0x1f1bdd = resolvePluginsDir(_0x572c14);
        if (!fs.existsSync(_0x1f1bdd)) {
            return [];
        }
        var _0x165529 = fs.readdirSync(_0x1f1bdd);
        var _0x575752 = _0x165529.filter(function (_0x2c37fa)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!/^[a-z0-9][a-z0-9-]*$/.test(_0x5a7014)) {
                    return false;
                }
                var _0x586b82 = path.join(_0x1f1bdd, _0x2c37fa, '.claude-plugin', 'plugin.json');
                return fs.existsSync(_0x586b82);
            }).sort();
        setCache(_0x572c14, 'plugins', _0x575752);
        return _0x575752;
    }
function discoverCommands(_0x5301bd)
    /*Scope Closed:false | writes:false*/
    {
        var _0x5a4469 = getCache(_0x5301bd);
        if (_0x5a4469 && _0x5a4469.commands) {
            return _0x5a4469.commands;
        }
        var _0x29db27 = resolvePluginsDir(_0x5301bd);
        var _0x17b526 = discoverPlugins(_0x5301bd);
        var _0x13e225 = [];
        var _iterator2 = _createForOfIteratorHelper(_0x17b526);
        var _step2;
        try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _0x182cce = _step2.value;
                var _0x4b3de1 = path.join(_0x29db27, _0x182cce, 'commands');
                if (!fs.existsSync(_0x4b3de1)) {
                    continue;
                }
                var _0x209473 = fs.readdirSync(_0x4b3de1).filter(function (_0x58767d)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        return _0x58767d.endsWith('.md');
                    }).sort();
                var _iterator3 = _createForOfIteratorHelper(_0x209473);
                var _step3;
                try {
                    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                        var _0xc9ef0f = _step3.value;
                        var _0x3a5334 = path.join(_0x4b3de1, _0xc9ef0f);
                        var _0x12f625 = fs.readFileSync(_0x3a5334, 'utf8');
                        var _0x390460 = parseFrontmatter(_0x12f625);
                        _0x13e225.push({
                            name: _0xc9ef0f.replace(/\.md$/, ''),
                            plugin: _0x182cce,
                            file: _0xc9ef0f,
                            frontmatter: _0x390460
                        });
                    }
                } catch (err) {
                    _iterator3.e(err);
                } finally {
                    _iterator3.f();
                }
            }
        } catch (err) {
            _iterator2.e(err);
        } finally {
            _iterator2.f();
        }
        setCache(_0x5301bd, 'commands', _0x13e225);
        return _0x13e225;
    }
function discoverAgents(_0x35de89)
    /*Scope Closed:false | writes:false*/
    {
        var _0x2351d0 = getCache(_0x35de89);
        if (_0x2351d0 && _0x2351d0.agents) {
            return _0x2351d0.agents;
        }
        var _0x56d966 = resolvePluginsDir(_0x35de89);
        var _0x2af2a1 = discoverPlugins(_0x35de89);
        var _0x2da07b = [];
        var _iterator4 = _createForOfIteratorHelper(_0x2af2a1);
        var _step4;
        try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var _0x33c160 = _step4.value;
                var _0x122191 = path.join(_0x56d966, _0x33c160, 'agents');
                if (!fs.existsSync(_0x122191)) {
                    continue;
                }
                var _0xcf3e8 = fs.readdirSync(_0x122191).filter(function (_0xab7d63)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        return _0xab7d63.endsWith('.md');
                    }).sort();
                var _iterator5 = _createForOfIteratorHelper(_0xcf3e8);
                var _step5;
                try {
                    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                        var _0xdb9d82 = _step5.value;
                        var _0x43359d = path.join(_0x122191, _0xdb9d82);
                        var _0x1a9c80 = fs.readFileSync(_0x43359d, 'utf8');
                        var _0xfc7ad8 = parseFrontmatter(_0x1a9c80);
                        _0x2da07b.push({
                            name: _0xdb9d82.replace(/\.md$/, ''),
                            plugin: _0x33c160,
                            file: _0xdb9d82,
                            frontmatter: _0xfc7ad8
                        });
                    }
                } catch (err) {
                    _iterator5.e(err);
                } finally {
                    _iterator5.f();
                }
            }
        } catch (err) {
            _iterator4.e(err);
        } finally {
            _iterator4.f();
        }
        setCache(_0x35de89, 'agents', _0x2da07b);
        return _0x2da07b;
    }
function discoverSkills(_0x35d02f)
    /*Scope Closed:false | writes:false*/
    {
        var _0xbfd202 = getCache(_0x35d02f);
        if (_0xbfd202 && _0xbfd202.skills) {
            return _0xbfd202.skills;
        }
        var _0x78a964 = resolvePluginsDir(_0x35d02f);
        var _0x40c2f7 = discoverPlugins(_0x35d02f);
        var _0x1528f7 = [];
        var _iterator6 = _createForOfIteratorHelper(_0x40c2f7);
        var _step6;
        try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                var _0x426b23 = _step6.value;
                var _0x1954e4 = path.join(_0x78a964, _0x426b23, 'skills');
                if (!fs.existsSync(_0x1954e4)) {
                    continue;
                }
                var _0xfea06a = fs.readdirSync(_0x1954e4).sort();
                var _iterator7 = _createForOfIteratorHelper(_0xfea06a);
                var _step7;
                try {
                    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                        var _0x3b2c97 = _step7.value;
                        var _0x7c4d39 = path.join(_0x1954e4, _0x3b2c97, 'SKILL.md');
                        if (fs.existsSync(_0x7c4d39)) {
                            var _0x13f96f = fs.readFileSync(_0x7c4d39, 'utf8');
                            var _0x362ba3 = parseFrontmatter(_0x13f96f);
                            var _0xda4525 = {
                                name: _0x3b2c97,
                                plugin: _0x426b23,
                                dir: _0x3b2c97,
                                frontmatter: _0x362ba3
                            };
                            _0x1528f7.push(_0xda4525);
                        }
                    }
                } catch (err) {
                    _iterator7.e(err);
                } finally {
                    _iterator7.f();
                }
            }
        } catch (err) {
            _iterator6.e(err);
        } finally {
            _iterator6.f();
        }
        setCache(_0x35d02f, 'skills', _0x1528f7);
        return _0x1528f7;
    }
function getCommandMappings(_0x41f28b)
    /*Scope Closed:false | writes:false*/
    {
        var _0x5543a4 = discoverCommands(_0x41f28b);
        return _0x5543a4.map(function (_0x10fe1a) {
            return [
                _0x10fe1a.file,
                _0x10fe1a.plugin,
                _0x10fe1a.file
            ];
        });
    }
function getCodexSkillMappings(_0x46e87a)
    /*Scope Closed:false | writes:false*/
    {
        var _0x2a36ed = discoverCommands(_0x46e87a);
        return _0x2a36ed.map(function (_0x20f9c1) {
            var _0x3aabf8 = _0x20f9c1.frontmatter['codex-description'] || _0x20f9c1.frontmatter.description || '';
            return [
                _0x20f9c1.name,
                _0x20f9c1.plugin,
                _0x20f9c1.file,
                _0x3aabf8
            ];
        });
    }
function getPluginPrefixRegex(_0x423229)
    /*Scope Closed:false | writes:false*/
    {
        var _0x5c3dd6 = discoverPlugins(_0x423229);
        if (_0x5c3dd6.length === 0) {
            return /$^/g;
        }
        var _0x54c76d = _0x5c3dd6.map(function (_0x5b2537)
            /* Called:undefined | Scope Closed:true*/
            {
                return _0x5b2537.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            });
        return new RegExp('(' + _0x54c76d.join('|') + ')', 'g');
    }
function discoverAll(_0x9c2e0b)
    /*Scope Closed:false | writes:false*/
    {
        return {
            plugins: discoverPlugins(_0x9c2e0b),
            commands: discoverCommands(_0x9c2e0b),
            agents: discoverAgents(_0x9c2e0b),
            skills: discoverSkills(_0x9c2e0b)
        };
    }
function getCache(_0x4f6f59)
    /*Scope Closed:false | writes:false*/
    {
        var _0x250816 = _0x4f6f59 || path.resolve(__dirname, '..', '..');
        if (null && null === _0x250816) {
            return null;
        }
        return null;
    }
function setCache(_0x31d90e, _0xf5c85a, _0x55f081)
    /*Scope Closed:false | writes:true*/
    {
        var _0x1b0864 = _0x31d90e || path.resolve(__dirname, '..', '..');
        if (!_cache || null !== _0x1b0864) {
            _cache = {};
            _cacheRoot = _0x1b0864;
        }
        _cache[_0xf5c85a] = _0x55f081;
    }
function invalidateCache()
    /*Scope Closed:true*/
    {
        _cache = null;
        _cacheRoot = null;
    }
function getCursorRuleMappings(_0x3098c8)
    /*Scope Closed:false | writes:false*/
    {
        var _0x4e620e = discoverCommands(_0x3098c8);
        return _0x4e620e.map(function (_0x39c6d2) {
            var _0x39349e = _0x39c6d2.frontmatter['cursor-description'] || _0x39c6d2.frontmatter['codex-description'] || _0x39c6d2.frontmatter.description || '';
            var _0x1b921d = _0x39c6d2.frontmatter.type || 'command';
            var _0x3b3b2c = _0x39c6d2.frontmatter.globs || '';
            return [
                'agentsys-' + _0x39c6d2.plugin + '-' + _0x39c6d2.name,
                _0x39c6d2.plugin,
                _0x39c6d2.file,
                _0x39349e,
                _0x1b921d,
                _0x3b3b2c
            ];
        });
    }
function getKiroSteeringMappings(_0x4f64bf)
    /*Scope Closed:false | writes:false*/
    {
        var _0x2cf06f = discoverCommands(_0x4f64bf);
        return _0x2cf06f.map(function (_0xa9dcf9) {
            var _0x1635cf = _0xa9dcf9.frontmatter['kiro-description'] || _0xa9dcf9.frontmatter['cursor-description'] || _0xa9dcf9.frontmatter['codex-description'] || _0xa9dcf9.frontmatter.description || '';
            return [
                _0xa9dcf9.name,
                _0xa9dcf9.plugin,
                _0xa9dcf9.file,
                _0x1635cf
            ];
        });
    }
var _0x16cbf2 = {
    parseFrontmatter: parseFrontmatter,
    isValidPluginName: isValidPluginName,
    discoverPlugins: discoverPlugins,
    discoverCommands: discoverCommands,
    discoverAgents: discoverAgents,
    discoverSkills: discoverSkills,
    discoverAll: discoverAll,
    getCommandMappings: getCommandMappings,
    getCodexSkillMappings: getCodexSkillMappings,
    getCursorRuleMappings: getCursorRuleMappings,
    getKiroSteeringMappings: getKiroSteeringMappings,
    getPluginPrefixRegex: getPluginPrefixRegex,
    invalidateCache: invalidateCache
};
module.exports = _0x16cbf2;