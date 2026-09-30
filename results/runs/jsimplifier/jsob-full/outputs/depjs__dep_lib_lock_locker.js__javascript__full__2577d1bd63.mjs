'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = undefined;
var _fs = require('fs');
var _path = _interopRequireDefault(require('path'));
function _interopRequireDefault(e)
    /*Scope Closed:true*/
    {
        if (e && e.__esModule) {
            return e;
        } else {
            return { default: e };
        }
    }
var pkgLockJSON = _path.default.join(process.cwd(), 'package-lock.json');
var toIntegrity = function toIntegrity(_0x48dede)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x48dede.integrity) {
            return _0x48dede.integrity;
        }
        if (_0x48dede.shasum) {
            return 'sha1-' + Buffer.from(_0x48dede.shasum, 'hex').toString('base64');
        }
        return undefined;
    };
var notEmpty = function notEmpty(_0x4a01b6)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return _0x4a01b6 && Object.keys(_0x4a01b6).length > 0;
    };
var _flatten = function flatten(_0x1a9ed2, _0x2c1fe1, _0x52ce51)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        Object.keys(_0x1a9ed2).forEach(function (_0x391394)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x107da4 = _0x1a9ed2[_0x391394];
                var _0x4c17ba = _0x2c1fe1 + 'node_modules/' + _0x391394;
                var _0x1d84d0 = {};
                if (_0x107da4.name && _0x107da4.name !== _0x391394) {
                    _0x1d84d0.name = _0x107da4.name;
                }
                _0x1d84d0.version = _0x107da4.version;
                var _0x41d641 = _0x107da4.tarball || _0x107da4.url;
                if (_0x41d641) {
                    _0x1d84d0.resolved = _0x41d641;
                }
                var _0xd2143b = toIntegrity(_0x107da4);
                if (_0xd2143b) {
                    _0x1d84d0.integrity = _0xd2143b;
                }
                if (_0x107da4.hasInstallScript) {
                    _0x1d84d0.hasInstallScript = true;
                }
                if (_0x107da4.license) {
                    _0x1d84d0.license = _0x107da4.license;
                }
                if (_0x107da4.engines) {
                    _0x1d84d0.engines = _0x107da4.engines;
                }
                if (_0x107da4.os) {
                    _0x1d84d0.os = _0x107da4.os;
                }
                if (_0x107da4.cpu) {
                    _0x1d84d0.cpu = _0x107da4.cpu;
                }
                if (_0x107da4.libc) {
                    _0x1d84d0.libc = _0x107da4.libc;
                }
                if (_0x107da4.bin) {
                    _0x1d84d0.bin = _0x107da4.bin;
                }
                if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
                    _0x1d84d0.dependencies = _0x107da4.requires;
                }
                if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
                    _0x1d84d0.optionalDependencies = _0x107da4.optionalDependencies;
                }
                if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
                    _0x1d84d0.peerDependencies = _0x107da4.peerDependencies;
                }
                if (_0x107da4.funding) {
                    _0x1d84d0.funding = _0x107da4.funding;
                }
                _0x52ce51[_0x4c17ba] = _0x1d84d0;
                if (_0x107da4.dependencies) {
                    _flatten(_0x107da4.dependencies, _0x2c1fe1 + 'node_modules/' + _0x391394 + '/', _0x52ce51);
                }
            });
        return _0x52ce51;
    };
var resolveFrom = function resolveFrom(_0x36a92b, _0x119f7f, _0x26bf3f)
    /* Called:undefined | Scope Closed:true*/
    {
        var _0x408c8e = _0x119f7f;
        while (true) {
            var _0x226cd8 = (_0x408c8e ? _0x119f7f + '/' : '') + 'node_modules/' + _0x26bf3f;
            if (_0x36a92b[_0x226cd8]) {
                return _0x226cd8;
            }
            if (!_0x119f7f) {
                return null;
            }
            var _0x30d24c = _0x408c8e.lastIndexOf('/node_modules/');
            if (_0x30d24c === -1) {
                _0x408c8e = '';
            } else {
                _0x408c8e = _0x408c8e.slice(0, _0x30d24c);
            }
        }
    };
var reachable = function reachable(_0x4731af, _0x855a9d, _0x267306)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _0x46fb43 = {};
        var _0x94a2cc = _0x855a9d.map(function (_0x3fe14a)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return resolveFrom(_0x4731af, '', _0x3fe14a);
            }).filter(Boolean);
        var _loop = function _loop()
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x5a2f6d = _0x94a2cc.pop();
                if (_0x46fb43[_0x5a2f6d]) {
                    return 0;
                }
                _0x46fb43[_0x5a2f6d] = true;
                var _0x44f72e = _0x4731af[_0x5a2f6d];
                var _0x2e677b = _0x5a2f6d;
                if (_0x44f72e && _0x44f72e.link) {
                    _0x2e677b = _0x44f72e.resolved;
                    _0x44f72e = _0x4731af[_0x44f72e.resolved];
                }
                if (!_0x4731af[_0x44f72e.resolved]) {
                    return 0;
                }
                var _0x6f46bb = Object.assign({}, _0x44f72e.dependencies);
                if (_0x267306) {
                    Object.assign(_0x6f46bb, _0x44f72e.optionalDependencies);
                } else {
                    Object.keys(_0x44f72e.optionalDependencies || {}).forEach(function (_0x5b3e37)
                        /* Called:undefined | Scope Closed:true*/
                        {
                        });
                }
                Object.keys(_0x6f46bb).forEach(function (_0x1ee693)
                    /* Called:undefined | Scope Closed:false| writes:true*/
                    {
                        var _0x5ed31a = resolveFrom(_0x4731af, _0x2e677b, _0x1ee693);
                        if (_0x5ed31a) {
                            _0x94a2cc.push(_0x5ed31a);
                        }
                    });
            };
        var _ret;
        while (_0x94a2cc.length) {
            _ret = _loop();
            if (_ret === 0) {
                continue;
            }
        }
        return _0x46fb43;
    };
var locker = function locker(_0x9c79a3, _0x4ba912, _0x44bf55 = [])
    /* Called:undefined | Scope Closed:false| writes:true*/
    {
        var _0x3043e4 = {};
        var _0x16803a = {
            name: _0x9c79a3.name,
            version: _0x9c79a3.version
        };
        var _0x53e511 = _0x16803a;
        if (_0x9c79a3.license) {
            _0x53e511.license = _0x9c79a3.license;
        }
        if (_0x9c79a3.workspaces) {
            _0x53e511.workspaces = _0x9c79a3.workspaces;
        }
        if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
            _0x53e511.dependencies = _0x9c79a3.dependencies;
        }
        if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
            _0x53e511.devDependencies = _0x9c79a3.devDependencies;
        }
        if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
            _0x53e511.optionalDependencies = _0x9c79a3.optionalDependencies;
        }
        _0x3043e4[''] = _0x53e511;
        _flatten(_0x4ba912, '', _0x3043e4);
        _0x44bf55.forEach(function (_0x545f70)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x3cea22 = _path.default.relative(process.cwd(), _0x545f70.dir).split(_path.default.sep).join('/');
                var _0x18d588 = {
                    name: _0x545f70.pkg.name,
                    version: _0x545f70.pkg.version
                };
                var _0x4d965d = _0x18d588;
                if (_0x545f70.pkg.license) {
                    _0x4d965d.license = _0x545f70.pkg.license;
                }
                if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
                    _0x4d965d.dependencies = _0x545f70.pkg.dependencies;
                }
                if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
                    _0x4d965d.devDependencies = _0x545f70.pkg.devDependencies;
                }
                if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
                    _0x4d965d.optionalDependencies = _0x545f70.pkg.optionalDependencies;
                }
                if (_0x4a01b6 && Object.keys(_0x4a01b6).length > 0) {
                    _0x4d965d.peerDependencies = _0x545f70.pkg.peerDependencies;
                }
                if (_0x545f70.pkg.bin) {
                    _0x4d965d.bin = _0x545f70.pkg.bin;
                }
                if (_0x545f70.pkg.engines) {
                    _0x4d965d.engines = _0x545f70.pkg.engines;
                }
                _0x3043e4[_0x3cea22] = _0x4d965d;
                var _0x57fef0 = {
                    resolved: _0x3cea22,
                    link: true
                };
                _0x3043e4['node_modules/' + _0x545f70.name] = _0x57fef0;
            });
        var _0x227a74 = _0x44bf55.flatMap(function (_0x1c0116)
            /* Called:undefined | Scope Closed:true*/
            {
                return Object.keys(_0x1c0116.pkg.devDependencies || {});
            });
        var _0x56815f = _0x44bf55.flatMap(function (_0x17878e)
            /* Called:undefined | Scope Closed:true*/
            {
                return Object.keys(_0x17878e.pkg.optionalDependencies || {});
            });
        var _0x584b4f = [
            Object.keys(_0x9c79a3.dependencies || {}),
            _0x44bf55.map(function (_0x585464)
                /* Called:undefined | Scope Closed:true*/
                {
                    return _0x585464.name;
                })
        ];
        var _0x2d1b0c = [
            Object.keys(_0x9c79a3.devDependencies || {}),
            _0x227a74
        ];
        var _0x552a71 = [
            Object.keys(_0x9c79a3.optionalDependencies || {}),
            _0x56815f
        ];
        var _0x308e0a = reachable(_0x3043e4, _0x584b4f, false);
        var _0x4af374 = reachable(_0x3043e4, _0x2d1b0c, false);
        var _0x4cf825 = reachable(_0x3043e4, [
            _0x584b4f,
            _0x552a71
        ], true);
        var _0x222439 = reachable(_0x3043e4, _0x2d1b0c, true);
        Object.keys(_0x3043e4).forEach(function (_0x51b10f)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                if (_0x51b10f === '') {
                    return;
                }
                if (_0x308e0a[_0x51b10f]) {
                    return;
                }
                if (_0x4af374[_0x51b10f]) {
                    _0x3043e4[_0x51b10f].dev = true;
                    return;
                }
                if (_0x4cf825[_0x51b10f] && _0x222439[_0x51b10f]) {
                    _0x3043e4[_0x51b10f].devOptional = true;
                } else if (_0x4cf825[_0x51b10f]) {
                    _0x3043e4[_0x51b10f].optional = true;
                } else if (_0x222439[_0x51b10f]) {
                    _0x3043e4[_0x51b10f].devOptional = true;
                }
            });
        var _0x5ea4dd = {};
        Object.keys(_0x3043e4).sort().forEach(function (_0x5ed087)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                _0x5ea4dd[_0x5ed087] = _0x3043e4[_0x5ed087];
            });
        var _0x131e6a = {
            name: _0x9c79a3.name,
            version: _0x9c79a3.version,
            lockfileVersion: 3,
            requires: true,
            packages: _0x5ea4dd
        };
        var _0x481cdc = _0x131e6a;
        _fs.writeFileSync(pkgLockJSON, JSON.stringify(_0x481cdc, null, 2) + '\n');
    };
var locker_default = exports.default = locker;