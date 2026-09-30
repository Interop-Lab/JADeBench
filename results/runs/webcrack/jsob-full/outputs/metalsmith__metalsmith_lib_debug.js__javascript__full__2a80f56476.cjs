var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x1666e9, _0x51c0f0) => function _0x19187d() {
  if (!_0x51c0f0) {
    (0, _0x1666e9[__getOwnPropNames(_0x1666e9)[0]])((_0x51c0f0 = {
      exports: {}
    }).exports, _0x51c0f0);
  }
  return _0x51c0f0.exports;
};
var require_helpers = __commonJS({
  "../work/metalsmith__metalsmith/lib/helpers.js"(_0x527896, _0x5520d4) {
    var _0x31a2b9 = require("fs");
    var {
      readFile: _0x11f468,
      writeFile: _0x2653ab,
      stat: _0x4a851a,
      mkdir: _0x4debda,
      chmod: _0x1f8ebc,
      ..._0x23cfad
    } = _0x31a2b9.promises;
    var {
      resolve: _0x57387e,
      relative: _0x419aa7,
      normalize: _0x426a1c,
      dirname: _0xddfdd2
    } = require("path");
    var _0x5c296f = require("micromatch");
    function _0x1e7d7b(_0x144889) {
      return typeof _0x144889 === "boolean";
    }
    function _0x35ff25(_0x38d66d) {
      return typeof _0x38d66d === "number" && !Number.isNaN(_0x38d66d);
    }
    function _0xa4e80(_0x38ea6f) {
      return _0x38ea6f !== null && typeof _0x38ea6f === "object";
    }
    function _0x3abc27(_0x46ec20) {
      return typeof _0x46ec20 === "string";
    }
    function _0x45932c(_0x370bca) {
      return typeof _0x370bca === "undefined";
    }
    function _0x51d4d8(_0x37525b) {
      return typeof _0x37525b === "function";
    }
    function _0x33ae18(_0x5c6820, _0x19af28, _0x4f9cab) {
      if (!_0x5c6820 || !_0x5c6820.length) {
        return [];
      }
      const _0x2ae9b7 = {
        format: _0x426a1c
      };
      _0x4f9cab = Object.assign({
        dot: true
      }, _0x4f9cab || {}, _0x2ae9b7);
      return _0x5c296f(_0x5c6820, _0x19af28, _0x4f9cab).sort();
    }
    function _0x1f1943(_0x357113) {
      return _0x31a2b9.createWriteStream(_0x357113, "utf-8");
    }
    function _0x3fba10(_0x2d4d41) {
      return _0x23cfad.rm(_0x2d4d41, {
        recursive: true,
        force: true
      });
    }
    function _0x1ce344(_0x1e5c5b, _0x3f4f58) {
      const {
        ignores: _0xff3c5,
        root: _0x345be8
      } = {
        ignores: [],
        root: ".",
        ...(_0x3f4f58 || {})
      };
      const _0x5bcd75 = _0xff3c5.filter(_0x3abc27);
      const _0x19ad24 = _0xff3c5.filter(_0x51d4d8);
      const _0x179f58 = [];
      const _0x46388e = [];
      const _0x38857b = [];
      const _0x71d474 = [];
      const _0x38cf96 = _0x23cfad.readdir(_0x1e5c5b).then(_0x478944 => {
        _0x478944.forEach(_0x59bb87 => {
          const _0x45c78c = _0x57387e(_0x1e5c5b, _0x59bb87);
          const _0x29620b = _0x419aa7(_0x345be8, _0x45c78c);
          if (!_0x33ae18(_0x29620b, _0x5bcd75).length) {
            _0x179f58.push(_0x45c78c);
            _0x46388e.push(_0x29620b);
          }
        });
        _0x179f58.forEach((_0x51b4fd, _0x248ab0) => {
          _0x38857b.push(_0x4a851a(_0x51b4fd).then(_0x2cf38f => {
            const _0x5793d7 = _0x19ad24.some(_0x3e9db2 => _0x3e9db2(_0x46388e[_0x248ab0], _0x2cf38f));
            if (_0x5793d7) {
              return;
            }
            if (_0x2cf38f.isDirectory()) {
              const _0x4b5485 = {
                root: _0x345be8,
                ignores: _0xff3c5
              };
              const _0x504798 = _0x1ce344(_0x51b4fd, _0x4b5485).then(_0x1be03d => {
                _0x71d474.push(..._0x1be03d);
              });
              return _0x504798;
            }
            _0x71d474.push([_0x46388e[_0x248ab0], _0x2cf38f]);
          }));
        });
        return Promise.all(_0x38857b).then(() => _0x71d474.sort((_0x1b48ab, _0x4d92a4) => _0x1b48ab[0] > _0x4d92a4[0] ? 1 : -1)).catch(_0x410eac => {
          throw _0x410eac;
        });
      });
      return _0x38cf96;
    }
    function _0x7de11c(_0x35bce6, _0x166163, _0x319f0c) {
      let _0x121c1a = Promise.resolve([]);
      _0x166163 = [..._0x166163];
      while (_0x166163.length) {
        const _0x2dfcd6 = _0x166163.splice(0, _0x319f0c);
        _0x121c1a = _0x121c1a.then(_0x163d91 => {
          return Promise.all(_0x2dfcd6.map((..._0x5f3d3e) => _0x35bce6(..._0x5f3d3e))).then(_0x577ed9 => [..._0x163d91, ..._0x577ed9]);
        });
      }
      return _0x121c1a;
    }
    function _0x54f91(_0x1e714c, _0x44f443, _0x7fff30) {
      return _0x4debda(_0xddfdd2(_0x1e714c), {
        recursive: true
      }).then(() => _0x2653ab(_0x1e714c, _0x44f443)).then(() => _0x7fff30 ? _0x1f8ebc(_0x1e714c, _0x7fff30) : Promise.resolve());
    }
    const _0x2a012c = {
      isBoolean: _0x1e7d7b,
      isNumber: _0x35ff25,
      isString: _0x3abc27,
      isObject: _0xa4e80,
      isUndefined: _0x45932c,
      isFunction: _0x51d4d8,
      match: _0x33ae18,
      rm: _0x3fba10,
      readdir: _0x1ce344,
      outputFile: _0x54f91,
      stat: _0x4a851a,
      readFile: _0x11f468,
      batchAsync: _0x7de11c,
      writeStream: _0x1f1943
    };
    var _0x452914 = _0x2a012c;
    _0x5520d4.exports = _0x452914;
  }
});
var debug = require("debug");
var utf8 = require("is-utf8");
var {
  isString
} = require_helpers();
var streamLogHandler = _0x2446c6 => (..._0x13f859) => _0x2446c6.write(require("util").format(..._0x13f859) + "\n");
debug.log = streamLogHandler(process.stderr);
var options = {};
const _0x331e72 = {
  get: function () {
    return debug.inspectOpts.colors;
  },
  set: function (_0x48005c) {
    debug.inspectOpts.colors = _0x48005c;
  }
};
const _0x3a1fc6 = {
  get: function () {
    return debug.log;
  },
  set: function (_0x1ac6a8) {
    debug.log = _0x1ac6a8;
  }
};
const _0x474dd6 = {
  colors: _0x331e72,
  handle: _0x3a1fc6
};
Object.defineProperties(options, _0x474dd6);
debug.formatters.b = function (_0x1837cf) {
  if (_0x1837cf instanceof Buffer && utf8(_0x1837cf)) {
    return _0x1837cf.toString().slice(0, 200) + "...";
  }
  return _0x1837cf;
};
function Debugger(_0x4de860) {
  if (!isString(_0x4de860)) {
    const _0x4f2624 = new Error("invalid debugger namespace \"" + _0x4de860 + "\"");
    _0x4f2624.code = "invalid_debugger_namespace";
    throw _0x4f2624;
  }
  const _0x211f39 = debug(_0x4de860);
  _0x211f39.log = (..._0x1a7f00) => options.handle(..._0x1a7f00);
  _0x211f39.color = 247;
  const _0x4e4365 = _0x211f39.extend("warn");
  _0x4e4365.color = 178;
  const _0x5b054f = _0x211f39.extend("info");
  _0x5b054f.color = 51;
  const _0x12a74e = _0x211f39.extend("error");
  _0x12a74e.color = 196;
  const _0x22dd47 = {
    warn: _0x4e4365,
    info: _0x5b054f,
    error: _0x12a74e
  };
  const _0x340f6a = Object.assign(_0x211f39, _0x22dd47);
  return _0x340f6a;
}
function proxy(_0x1b39ad, _0x4d7bf2, _0x1e6b3f) {
  Object.defineProperty(_0x1b39ad, _0x1e6b3f, {
    get() {
      return _0x4d7bf2[_0x1e6b3f];
    },
    set(_0x5857f1) {
      _0x4d7bf2[_0x1e6b3f] = _0x5857f1;
    }
  });
}
proxy(Debugger, options, "handle");
proxy(Debugger, options, "colors");
proxy(Debugger, debug, "enabled");
proxy(Debugger, debug, "enable");
proxy(Debugger, debug, "disable");
const _0x411bab = {
  Debugger: Debugger,
  fileLogHandler: streamLogHandler
};
module.exports = _0x411bab;