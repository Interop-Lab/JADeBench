var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x58c054, _0x1cd7d3) => function _0x2abde7() {
  if (!_0x1cd7d3) {
    (0, _0x58c054[__getOwnPropNames(_0x58c054)[0]])((_0x1cd7d3 = {
      exports: {}
    }).exports, _0x1cd7d3);
  }
  return _0x1cd7d3.exports;
};
var require_collection = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/type/collection.js"(_0x20dcae, _0x3fbc37) {
    var _0x5aa66 = class {
      constructor(_0xbc46d3, _0x22f353) {
        if (_0xbc46d3 == null && _0x22f353 == null) {
          this._data = [];
          this._refs = [];
        } else {
          if (_0xbc46d3.length !== _0x22f353.length) {
            throw Error("Collection: data length should match references length.");
          }
          this._data = _0xbc46d3;
          this._refs = _0x22f353;
        }
      }
      get data() {
        return this._data;
      }
      get refs() {
        return this._refs;
      }
      get length() {
        return this._data.length;
      }
      add(_0x6a4c94, _0x5144d1) {
        this._data.push(_0x6a4c94);
        this._refs.push(_0x5144d1);
      }
    };
    _0x3fbc37.exports = _0x5aa66;
  }
});
var require_helpers = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/helpers.js"(_0x347ed6, _0x5b849a) {
    var _0x93dd56 = require_error();
    var _0xd50e78 = require_collection();
    var _0x1eb82c = {
      NUMBER: 0,
      ARRAY: 1,
      BOOLEAN: 2,
      STRING: 3,
      RANGE_REF: 4,
      CELL_REF: 5,
      COLLECTIONS: 6,
      NUMBER_NO_BOOLEAN: 10
    };
    var _0x434382 = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1.1240007277776077e+21, 2.585201673888498e+22, 6.204484017332394e+23, 1.5511210043330986e+25, 4.0329146112660565e+26, 1.0888869450418352e+28, 3.0488834461171387e+29, 8.841761993739702e+30, 2.6525285981219107e+32, 8.222838654177922e+33, 2.631308369336935e+35, 8.683317618811886e+36, 2.9523279903960416e+38, 1.0333147966386145e+40, 3.7199332678990125e+41, 1.3763753091226346e+43, 5.230226174666011e+44, 2.0397882081197444e+46, 8.159152832478977e+47, 3.345252661316381e+49, 1.40500611775288e+51, 6.041526306337383e+52, 2.658271574788449e+54, 1.1962222086548019e+56, 5.502622159812089e+57, 2.5862324151116818e+59, 1.2413915592536073e+61, 6.082818640342675e+62, 3.0414093201713376e+64, 1.5511187532873822e+66, 8.065817517094388e+67, 4.2748832840600255e+69, 2.308436973392414e+71, 1.2696403353658276e+73, 7.109985878048635e+74, 4.0526919504877214e+76, 2.3505613312828785e+78, 1.3868311854568984e+80, 8.32098711274139e+81, 5.075802138772248e+83, 3.146997326038794e+85, 1.98260831540444e+87, 1.2688693218588417e+89, 8.247650592082472e+90, 5.443449390774431e+92, 3.647111091818868e+94, 2.4800355424368305e+96, 1.711224524281413e+98, 1.1978571669969892e+100, 8.504785885678623e+101, 6.1234458376886085e+103, 4.4701154615126844e+105, 3.307885441519386e+107, 2.48091408113954e+109, 1.8854947016660504e+111, 1.4518309202828587e+113, 1.1324281178206297e+115, 8.946182130782976e+116, 7.156945704626381e+118, 5.797126020747368e+120, 4.753643337012842e+122, 3.945523969720659e+124, 3.314240134565353e+126, 2.81710411438055e+128, 2.4227095383672734e+130, 2.107757298379528e+132, 1.8548264225739844e+134, 1.650795516090846e+136, 1.4857159644817615e+138, 1.352001527678403e+140, 1.2438414054641308e+142, 1.1567725070816416e+144, 1.087366156656743e+146, 1.032997848823906e+148, 9.916779348709496e+149, 9.619275968248212e+151, 9.426890448883248e+153, 9.332621544394415e+155, 9.332621544394415e+157];
    var _0x2cfb06 = {};
    Object.keys(_0x1eb82c).forEach(_0x55d2a3 => {
      _0x2cfb06[_0x1eb82c[_0x55d2a3]] = _0x55d2a3;
    });
    var _0x4490b0 = class {
      constructor() {
        this.Types = _0x1eb82c;
        var _0x36c71f = {
          number: _0x1eb82c.NUMBER,
          boolean: _0x1eb82c.BOOLEAN,
          string: _0x1eb82c.STRING,
          object: -1
        };
        this.type2Number = _0x36c71f;
      }
      checkFunctionResult(_0x431bc7) {
        const _0x33372b = typeof _0x431bc7;
        if (_0x33372b === "number") {
          if (isNaN(_0x431bc7)) {
            return _0x93dd56.VALUE;
          } else if (!isFinite(_0x431bc7)) {
            return _0x93dd56.NUM;
          }
        }
        if (_0x431bc7 === undefined || _0x431bc7 === null) {
          return _0x93dd56.NULL;
        }
        return _0x431bc7;
      }
      flattenDeep(_0x54af56) {
        return _0x54af56.reduce((_0x453d26, _0x5f3a2a) => Array.isArray(_0x5f3a2a) ? _0x453d26.concat(this.flattenDeep(_0x5f3a2a)) : _0x453d26.concat(_0x5f3a2a), []);
      }
      acceptNumber(_0x594a69, _0x17a387 = true, _0x5c5f97 = true) {
        if (_0x594a69 instanceof _0x93dd56) {
          return _0x594a69;
        }
        let _0x4891c7;
        if (typeof _0x594a69 === "number") {
          _0x4891c7 = _0x594a69;
        } else if (typeof _0x594a69 === "boolean") {
          if (_0x5c5f97) {
            _0x4891c7 = Number(_0x594a69);
          } else {
            throw _0x93dd56.VALUE;
          }
        } else if (typeof _0x594a69 === "string") {
          if (_0x594a69.length === 0) {
            throw _0x93dd56.VALUE;
          }
          _0x4891c7 = Number(_0x594a69);
          if (_0x4891c7 !== _0x4891c7) {
            throw _0x93dd56.VALUE;
          }
        } else if (Array.isArray(_0x594a69)) {
          if (!_0x17a387) {
            if (_0x594a69[0].length === 1) {
              _0x4891c7 = this.acceptNumber(_0x594a69[0][0]);
            } else {
              throw _0x93dd56.VALUE;
            }
          } else {
            _0x4891c7 = this.acceptNumber(_0x594a69[0][0]);
          }
        } else {
          throw Error("Unknown type in FormulaHelpers.acceptNumber");
        }
        return _0x4891c7;
      }
      flattenParams(_0x3dc046, _0x23e1c8, _0x5d1ebb, _0x20c8e7, _0x29e025 = null, _0x4dd2aa = 1) {
        if (_0x3dc046.length < _0x4dd2aa) {
          throw _0x93dd56.ARG_MISSING([_0x23e1c8]);
        }
        if (_0x29e025 == null) {
          _0x29e025 = _0x23e1c8 === _0x1eb82c.NUMBER ? 0 : _0x23e1c8 == null ? null : "";
        }
        _0x3dc046.forEach(_0x33e60a => {
          const {
            isCellRef: _0x556aa8,
            isRangeRef: _0x42ffc5,
            isArray: _0x16edc6
          } = _0x33e60a;
          const _0x598fc6 = _0x33e60a.value instanceof _0xd50e78;
          const _0x172b4a = !_0x556aa8 && !_0x42ffc5 && !_0x16edc6 && !_0x598fc6;
          var _0x376069 = {
            isLiteral: _0x172b4a,
            isCellRef: _0x556aa8,
            isRangeRef: _0x42ffc5,
            isArray: _0x16edc6,
            isUnion: _0x598fc6
          };
          const _0x403c81 = _0x376069;
          if (_0x172b4a) {
            if (_0x33e60a.omitted) {
              _0x33e60a = _0x29e025;
            } else {
              _0x33e60a = this.accept(_0x33e60a, _0x23e1c8, _0x29e025);
            }
            _0x20c8e7(_0x33e60a, _0x403c81);
          } else if (_0x556aa8) {
            _0x20c8e7(_0x33e60a.value, _0x403c81);
          } else if (_0x598fc6) {
            if (!_0x5d1ebb) {
              throw _0x93dd56.VALUE;
            }
            _0x33e60a = _0x33e60a.value.data;
            _0x33e60a = this.flattenDeep(_0x33e60a);
            _0x33e60a.forEach(_0x53c6c7 => {
              _0x20c8e7(_0x53c6c7, _0x403c81);
            });
          } else if (_0x42ffc5 || _0x16edc6) {
            _0x33e60a = this.flattenDeep(_0x33e60a.value);
            _0x33e60a.forEach(_0x202991 => {
              _0x20c8e7(_0x202991, _0x403c81);
            });
          }
        });
      }
      accept(_0x40f8b7, _0x79ce9 = null, _0x5a11b2, _0x46de5d = true, _0x5ae4f7 = false) {
        if (Array.isArray(_0x79ce9)) {
          _0x79ce9 = _0x79ce9[0];
        }
        if (_0x40f8b7 == null && _0x5a11b2 === undefined) {
          throw _0x93dd56.ARG_MISSING([_0x79ce9]);
        } else if (_0x40f8b7 == null) {
          return _0x5a11b2;
        }
        if (typeof _0x40f8b7 !== "object" || Array.isArray(_0x40f8b7)) {
          return _0x40f8b7;
        }
        const _0x65c2b1 = _0x40f8b7.isArray;
        if (_0x40f8b7.value != null) {
          _0x40f8b7 = _0x40f8b7.value;
        }
        if (_0x79ce9 == null) {
          return _0x40f8b7;
        }
        if (_0x40f8b7 instanceof _0x93dd56) {
          throw _0x40f8b7;
        }
        if (_0x79ce9 === _0x1eb82c.ARRAY) {
          if (Array.isArray(_0x40f8b7)) {
            if (_0x46de5d) {
              return this.flattenDeep(_0x40f8b7);
            } else {
              return _0x40f8b7;
            }
          } else if (_0x40f8b7 instanceof _0xd50e78) {
            throw _0x93dd56.VALUE;
          } else if (_0x5ae4f7) {
            if (_0x46de5d) {
              return [_0x40f8b7];
            } else {
              return [[_0x40f8b7]];
            }
          }
          throw _0x93dd56.VALUE;
        } else if (_0x79ce9 === _0x1eb82c.COLLECTIONS) {
          return _0x40f8b7;
        }
        if (_0x65c2b1) {
          _0x40f8b7 = _0x40f8b7[0][0];
        }
        const _0x646093 = this.type(_0x40f8b7);
        if (_0x79ce9 === _0x1eb82c.STRING) {
          if (_0x646093 === _0x1eb82c.BOOLEAN) {
            _0x40f8b7 = _0x40f8b7 ? "TRUE" : "FALSE";
          } else {
            _0x40f8b7 = "" + _0x40f8b7;
          }
        } else if (_0x79ce9 === _0x1eb82c.BOOLEAN) {
          if (_0x646093 === _0x1eb82c.STRING) {
            throw _0x93dd56.VALUE;
          }
          if (_0x646093 === _0x1eb82c.NUMBER) {
            _0x40f8b7 = Boolean(_0x40f8b7);
          }
        } else if (_0x79ce9 === _0x1eb82c.NUMBER) {
          _0x40f8b7 = this.acceptNumber(_0x40f8b7, false);
        } else if (_0x79ce9 === _0x1eb82c.NUMBER_NO_BOOLEAN) {
          _0x40f8b7 = this.acceptNumber(_0x40f8b7, false, false);
        } else {
          throw _0x93dd56.VALUE;
        }
        return _0x40f8b7;
      }
      type(_0x9977ec) {
        let _0x5c5405 = this.type2Number[typeof _0x9977ec];
        if (_0x5c5405 === -1) {
          if (Array.isArray(_0x9977ec)) {
            _0x5c5405 = _0x1eb82c.ARRAY;
          } else if (_0x9977ec.ref) {
            if (_0x9977ec.ref.from) {
              _0x5c5405 = _0x1eb82c.RANGE_REF;
            } else {
              _0x5c5405 = _0x1eb82c.CELL_REF;
            }
          } else if (_0x9977ec instanceof _0xd50e78) {
            _0x5c5405 = _0x1eb82c.COLLECTIONS;
          }
        }
        return _0x5c5405;
      }
      isRangeRef(_0xdcebbe) {
        return _0xdcebbe.ref && _0xdcebbe.ref.from;
      }
      isCellRef(_0x1fe20b) {
        return _0x1fe20b.ref && !_0x1fe20b.ref.from;
      }
      retrieveRanges(_0xc9a5e2, _0x313230, _0x3f6812) {
        _0x3f6812 = _0x5a51ea.extend(_0x313230, _0x3f6812);
        _0x313230 = this.retrieveArg(_0xc9a5e2, _0x313230);
        _0x313230 = _0x4352ad.accept(_0x313230, _0x1eb82c.ARRAY, undefined, false, true);
        if (_0x3f6812 !== _0x313230) {
          _0x3f6812 = this.retrieveArg(_0xc9a5e2, _0x3f6812);
          _0x3f6812 = _0x4352ad.accept(_0x3f6812, _0x1eb82c.ARRAY, undefined, false, true);
        } else {
          _0x3f6812 = _0x313230;
        }
        return [_0x313230, _0x3f6812];
      }
      retrieveArg(_0x2fdaef, _0x273381) {
        if (_0x273381 === null) {
          return {
            value: 0,
            isArray: false,
            omitted: true
          };
        }
        const _0x29b8d3 = _0x2fdaef.utils.extractRefValue(_0x273381);
        var _0x2bb713 = {
          value: _0x29b8d3.val,
          isArray: _0x29b8d3.isArray,
          ref: _0x273381.ref
        };
        return _0x2bb713;
      }
    };
    var _0x4352ad = new _0x4490b0();
    var _0x1967e7 = {
      isWildCard: _0x3e54f9 => {
        if (typeof _0x3e54f9 === "string") {
          return /[*?]/.test(_0x3e54f9);
        }
        return false;
      },
      toRegex: (_0x46c93, _0x17af82) => {
        return RegExp(_0x46c93.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/([^~]??)[?]/g, "$1.").replace(/([^~]??)[*]/g, "$1.*").replace(/~([?*])/g, "$1"), _0x17af82);
      }
    };
    var _0x201e6b = {
      parse: _0x4c462a => {
        const _0x2abec5 = typeof _0x4c462a;
        if (_0x2abec5 === "string") {
          const _0x4631f1 = _0x4c462a.toUpperCase();
          if (_0x4631f1 === "TRUE" || _0x4631f1 === "FALSE") {
            return {
              op: "=",
              value: _0x4631f1 === "TRUE"
            };
          }
          const _0x391114 = _0x4c462a.match(/(<>|>=|<=|>|<|=)(.*)/);
          if (_0x391114) {
            let _0x5f2479 = _0x391114[1];
            let _0x179e1a;
            if (isNaN(_0x391114[2])) {
              const _0x299856 = _0x391114[2].toUpperCase();
              if (_0x299856 === "TRUE" || _0x299856 === "FALSE") {
                _0x179e1a = _0x299856 === "TRUE";
              } else if (/#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A|#REF!/.test(_0x391114[2])) {
                _0x179e1a = new _0x93dd56(_0x391114[2]);
              } else {
                _0x179e1a = _0x391114[2];
                if (_0x1967e7.isWildCard(_0x179e1a)) {
                  return {
                    op: "wc",
                    value: _0x1967e7.toRegex(_0x179e1a),
                    match: _0x5f2479 === "="
                  };
                }
              }
            } else {
              _0x179e1a = Number(_0x391114[2]);
            }
            var _0xbacf88 = {
              op: _0x5f2479,
              value: _0x179e1a
            };
            return _0xbacf88;
          } else if (_0x1967e7.isWildCard(_0x4c462a)) {
            return {
              op: "wc",
              value: _0x1967e7.toRegex(_0x4c462a),
              match: true
            };
          } else {
            var _0x380c27 = {
              op: "=",
              value: _0x4c462a
            };
            return _0x380c27;
          }
        } else if (_0x2abec5 === "boolean" || _0x2abec5 === "number" || Array.isArray(_0x4c462a) || _0x4c462a instanceof _0x93dd56) {
          var _0x5ac32c = {
            op: "=",
            value: _0x4c462a
          };
          return _0x5ac32c;
        } else {
          throw Error("Criteria.parse: type " + typeof _0x4c462a + " not support");
        }
      }
    };
    var _0x5a51ea = {
      columnNumberToName: _0xeb006f => {
        let _0x1a06d9 = _0xeb006f;
        let _0x3a4cf0 = "";
        let _0x3b7083 = 0;
        while (_0x1a06d9 > 0) {
          _0x3b7083 = (_0x1a06d9 - 1) % 26;
          _0x3a4cf0 = String.fromCharCode("A".charCodeAt(0) + _0x3b7083) + _0x3a4cf0;
          _0x1a06d9 = Math.floor((_0x1a06d9 - _0x3b7083) / 26);
        }
        return _0x3a4cf0;
      },
      columnNameToNumber: _0x1d298e => {
        _0x1d298e = _0x1d298e.toUpperCase();
        const _0x3242e1 = _0x1d298e.length;
        let _0x117169 = 0;
        for (let _0x3a56dc = 0; _0x3a56dc < _0x3242e1; _0x3a56dc++) {
          const _0x31a232 = _0x1d298e.charCodeAt(_0x3a56dc);
          if (!isNaN(_0x31a232)) {
            _0x117169 += (_0x31a232 - 64) * 26 ** (_0x3242e1 - _0x3a56dc - 1);
          }
        }
        return _0x117169;
      },
      extend: (_0x1448e7, _0x5ce7dd) => {
        if (_0x5ce7dd == null) {
          return _0x1448e7;
        }
        let _0x334f2d;
        let _0x251f96;
        if (_0x4352ad.isCellRef(_0x1448e7)) {
          _0x334f2d = 0;
          _0x251f96 = 0;
        } else if (_0x4352ad.isRangeRef(_0x1448e7)) {
          _0x334f2d = _0x1448e7.ref.to.row - _0x1448e7.ref.from.row;
          _0x251f96 = _0x1448e7.ref.to.col - _0x1448e7.ref.from.col;
        } else {
          throw Error("Address.extend should not reach here.");
        }
        if (_0x4352ad.isCellRef(_0x5ce7dd)) {
          if (_0x334f2d > 0 || _0x251f96 > 0) {
            _0x5ce7dd = {
              ref: {
                from: {
                  col: _0x5ce7dd.ref.col,
                  row: _0x5ce7dd.ref.row
                },
                to: {
                  row: _0x5ce7dd.ref.row + _0x334f2d,
                  col: _0x5ce7dd.ref.col + _0x251f96
                }
              }
            };
          }
        } else {
          _0x5ce7dd.ref.to.row = _0x5ce7dd.ref.from.row + _0x334f2d;
          _0x5ce7dd.ref.to.col = _0x5ce7dd.ref.from.col + _0x251f96;
        }
        return _0x5ce7dd;
      }
    };
    var _0x252854 = {
      FormulaHelpers: _0x4352ad,
      Types: _0x1eb82c,
      ReversedTypes: _0x2cfb06,
      Factorials: _0x434382,
      WildCard: _0x1967e7,
      Criteria: _0x201e6b,
      Address: _0x5a51ea
    };
    _0x5b849a.exports = _0x252854;
  }
});
var require_error = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/error.js"(_0x3be125, _0x26a082) {
    var _0x24ec5f = class _0x4c62f0 extends Error {
      constructor(_0x2307f4, _0xd2a910, _0x153b1b) {
        super(_0xd2a910);
        if (_0xd2a910 == null && _0x153b1b == null && _0x4c62f0.errorMap.has(_0x2307f4)) {
          return _0x4c62f0.errorMap.get(_0x2307f4);
        } else if (_0xd2a910 == null && _0x153b1b == null) {
          this._error = _0x2307f4;
          _0x4c62f0.errorMap.set(_0x2307f4, this);
        } else {
          this._error = _0x2307f4;
        }
        this.details = _0x153b1b;
      }
      get error() {
        return this._error;
      }
      get name() {
        return this._error;
      }
      equals(_0x5e782b) {
        return _0x5e782b instanceof _0x4c62f0 && _0x5e782b._error === this._error;
      }
      toString() {
        return this._error;
      }
    };
    _0x24ec5f.errorMap = new Map();
    _0x24ec5f.DIV0 = new _0x24ec5f("#DIV/0!");
    _0x24ec5f.NA = new _0x24ec5f("#N/A");
    _0x24ec5f.NAME = new _0x24ec5f("#NAME?");
    _0x24ec5f.NULL = new _0x24ec5f("#NULL!");
    _0x24ec5f.NUM = new _0x24ec5f("#NUM!");
    _0x24ec5f.REF = new _0x24ec5f("#REF!");
    _0x24ec5f.VALUE = new _0x24ec5f("#VALUE!");
    _0x24ec5f.NOT_IMPLEMENTED = _0x5e2f52 => {
      return new _0x24ec5f("#NAME?", "Function " + _0x5e2f52 + " is not implemented.");
    };
    _0x24ec5f.TOO_MANY_ARGS = _0x128c8d => {
      return new _0x24ec5f("#N/A", "Function " + _0x128c8d + " has too many arguments.");
    };
    _0x24ec5f.ARG_MISSING = _0x9847d0 => {
      const {
        Types: _0x90186
      } = require_helpers();
      return new _0x24ec5f("#N/A", "Argument type " + _0x9847d0.map(_0xdedd03 => _0x90186[_0xdedd03]).join(", ") + " is missing.");
    };
    _0x24ec5f.ERROR = (_0x3d240f, _0x1cc0a4) => {
      return new _0x24ec5f("#ERROR!", _0x3d240f, _0x1cc0a4);
    };
    _0x26a082.exports = _0x24ec5f;
  }
});
module.exports = require_error();