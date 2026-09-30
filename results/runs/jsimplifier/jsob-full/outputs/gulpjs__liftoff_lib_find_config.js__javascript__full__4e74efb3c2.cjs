'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x2c5be7, _0x523793)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x3f3631()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x523793) {
                    _0x2c5be7[Object.getOwnPropertyNames(_0x2c5be7)[0]]((_0x523793 = { exports: {} }).exports, _0x523793);
                }
                return _0x523793.exports;
            };
    };
var require_file_search = function _0x3f3631()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x523793) {
            _0x2c5be7[Object.getOwnPropertyNames(_0x2c5be7)[0]]((_0x523793 = { exports: {} }).exports, _0x523793);
        }
        return _0x523793.exports;
    };
var fs = require('fs');
var path = require('path');
var fileSearch = require_file_search();
module.exports = function (_0x4db6b4)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        _0x4db6b4 = _0x4db6b4 || {};
        var _0x587bfd = _0x4db6b4.configNameSearch;
        var _0x40fb47 = _0x4db6b4.configPath;
        var _0x567947 = _0x4db6b4.searchPaths;
        if (!_0x4db6b4.configPath) {
            if (!Array.isArray(_0x567947)) {
                throw new Error('Please provide an array of paths to search for config in_.');
            }
            if (!_0x4db6b4.configNameSearch) {
                throw new Error('Please provide a configNameSearch.');
            }
            _0x40fb47 = fileSearch_new(_0x587bfd, _0x567947);
        }
        if (_0x40fb47 && fs.existsSync(_0x40fb47)) {
            return path.resolve(_0x40fb47);
        }
        return null;
    };