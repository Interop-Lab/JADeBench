var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x2c5be7, _0x523793) => function _0x3f3631() {
  if (!_0x523793) {
    (0, _0x2c5be7[__getOwnPropNames(_0x2c5be7)[0]])((_0x523793 = {
      exports: {}
    }).exports, _0x523793);
  }
  return _0x523793.exports;
};
var require_file_search = __commonJS({
  "../work/gulpjs__liftoff/lib/file_search.js"(_0x1191c3, _0x183d95) {
    var _0x5a3591 = require("findup-sync");
    _0x183d95.exports = function (_0x24db16, _0x47ff45) {
      var _0x4d880d;
      var _0x37ff5c = _0x47ff45.length;
      for (var _0x3fa912 = 0; _0x3fa912 < _0x37ff5c; _0x3fa912++) {
        if (_0x4d880d) {
          break;
        } else {
          var _0x5c2d96 = {
            cwd: _0x47ff45[_0x3fa912],
            nocase: true
          };
          _0x4d880d = _0x5a3591(_0x24db16, _0x5c2d96);
        }
      }
      return _0x4d880d;
    };
  }
});
var fs = require("fs");
var path = require("path");
var fileSearch = require_file_search();
module.exports = function (_0x4db6b4) {
  _0x4db6b4 = _0x4db6b4 || {};
  var _0x587bfd = _0x4db6b4.configNameSearch;
  var _0x40fb47 = _0x4db6b4.configPath;
  var _0x567947 = _0x4db6b4.searchPaths;
  if (!_0x40fb47) {
    if (!Array.isArray(_0x567947)) {
      throw new Error("Please provide an array of paths to search for config in.");
    }
    if (!_0x587bfd) {
      throw new Error("Please provide a configNameSearch.");
    }
    _0x40fb47 = fileSearch(_0x587bfd, _0x567947);
  }
  if (_0x40fb47 && fs.existsSync(_0x40fb47)) {
    return path.resolve(_0x40fb47);
  }
  return null;
};