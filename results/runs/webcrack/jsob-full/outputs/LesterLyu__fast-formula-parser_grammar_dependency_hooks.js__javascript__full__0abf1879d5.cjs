var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0xfa6444, _0x4bbe03) => function _0x2fea21() {
  if (!_0x4bbe03) {
    (0, _0xfa6444[__getOwnPropNames(_0xfa6444)[0]])((_0x4bbe03 = {
      exports: {}
    }).exports, _0x4bbe03);
  }
  return _0x4bbe03.exports;
};
var require_collection = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/type/collection.js"(_0x638363, _0x5774d4) {
    var _0x591edd = class {
      constructor(_0x38c8e0, _0x3a25ae) {
        if (_0x38c8e0 == null && _0x3a25ae == null) {
          this._data = [];
          this._refs = [];
        } else {
          if (_0x38c8e0.length !== _0x3a25ae.length) {
            throw Error("Collection: data length should match references length.");
          }
          this._data = _0x38c8e0;
          this._refs = _0x3a25ae;
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
      add(_0x3b7b3a, _0x1337bd) {
        this._data.push(_0x3b7b3a);
        this._refs.push(_0x1337bd);
      }
    };
    _0x5774d4.exports = _0x591edd;
  }
});
var require_helpers = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/helpers.js"(_0x4bd123, _0x1562e) {
    var _0x2a9112 = require_error();
    var _0x5daef0 = require_collection();
    var _0x38472c = {
      NUMBER: 0,
      ARRAY: 1,
      BOOLEAN: 2,
      STRING: 3,
      RANGE_REF: 4,
      CELL_REF: 5,
      COLLECTIONS: 6,
      NUMBER_NO_BOOLEAN: 10
    };
    var _0x2d6e5a = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1.1240007277776077e+21, 2.585201673888498e+22, 6.204484017332394e+23, 1.5511210043330986e+25, 4.0329146112660565e+26, 1.0888869450418352e+28, 3.0488834461171387e+29, 8.841761993739702e+30, 2.6525285981219107e+32, 8.222838654177922e+33, 2.631308369336935e+35, 8.683317618811886e+36, 2.9523279903960416e+38, 1.0333147966386145e+40, 3.7199332678990125e+41, 1.3763753091226346e+43, 5.230226174666011e+44, 2.0397882081197444e+46, 8.159152832478977e+47, 3.345252661316381e+49, 1.40500611775288e+51, 6.041526306337383e+52, 2.658271574788449e+54, 1.1962222086548019e+56, 5.502622159812089e+57, 2.5862324151116818e+59, 1.2413915592536073e+61, 6.082818640342675e+62, 3.0414093201713376e+64, 1.5511187532873822e+66, 8.065817517094388e+67, 4.2748832840600255e+69, 2.308436973392414e+71, 1.2696403353658276e+73, 7.109985878048635e+74, 4.0526919504877214e+76, 2.3505613312828785e+78, 1.3868311854568984e+80, 8.32098711274139e+81, 5.075802138772248e+83, 3.146997326038794e+85, 1.98260831540444e+87, 1.2688693218588417e+89, 8.247650592082472e+90, 5.443449390774431e+92, 3.647111091818868e+94, 2.4800355424368305e+96, 1.711224524281413e+98, 1.1978571669969892e+100, 8.504785885678623e+101, 6.1234458376886085e+103, 4.4701154615126844e+105, 3.307885441519386e+107, 2.48091408113954e+109, 1.8854947016660504e+111, 1.4518309202828587e+113, 1.1324281178206297e+115, 8.946182130782976e+116, 7.156945704626381e+118, 5.797126020747368e+120, 4.753643337012842e+122, 3.945523969720659e+124, 3.314240134565353e+126, 2.81710411438055e+128, 2.4227095383672734e+130, 2.107757298379528e+132, 1.8548264225739844e+134, 1.650795516090846e+136, 1.4857159644817615e+138, 1.352001527678403e+140, 1.2438414054641308e+142, 1.1567725070816416e+144, 1.087366156656743e+146, 1.032997848823906e+148, 9.916779348709496e+149, 9.619275968248212e+151, 9.426890448883248e+153, 9.332621544394415e+155, 9.332621544394415e+157];
    var _0xb5f9e7 = {};
    Object.keys(_0x38472c).forEach(_0x10640a => {
      _0xb5f9e7[_0x38472c[_0x10640a]] = _0x10640a;
    });
    var _0x4c1766 = class {
      constructor() {
        this.Types = _0x38472c;
        var _0x3ac611 = {
          number: _0x38472c.NUMBER,
          boolean: _0x38472c.BOOLEAN,
          string: _0x38472c.STRING,
          object: -1
        };
        this.type2Number = _0x3ac611;
      }
      checkFunctionResult(_0x3d128c) {
        const _0x39059c = typeof _0x3d128c;
        if (_0x39059c === "number") {
          if (isNaN(_0x3d128c)) {
            return _0x2a9112.VALUE;
          } else if (!isFinite(_0x3d128c)) {
            return _0x2a9112.NUM;
          }
        }
        if (_0x3d128c === undefined || _0x3d128c === null) {
          return _0x2a9112.NULL;
        }
        return _0x3d128c;
      }
      flattenDeep(_0x482761) {
        return _0x482761.reduce((_0x2be8e3, _0x575941) => Array.isArray(_0x575941) ? _0x2be8e3.concat(this.flattenDeep(_0x575941)) : _0x2be8e3.concat(_0x575941), []);
      }
      acceptNumber(_0x367cbf, _0x6cdf08 = true, _0x184831 = true) {
        if (_0x367cbf instanceof _0x2a9112) {
          return _0x367cbf;
        }
        let _0x2566cc;
        if (typeof _0x367cbf === "number") {
          _0x2566cc = _0x367cbf;
        } else if (typeof _0x367cbf === "boolean") {
          if (_0x184831) {
            _0x2566cc = Number(_0x367cbf);
          } else {
            throw _0x2a9112.VALUE;
          }
        } else if (typeof _0x367cbf === "string") {
          if (_0x367cbf.length === 0) {
            throw _0x2a9112.VALUE;
          }
          _0x2566cc = Number(_0x367cbf);
          if (_0x2566cc !== _0x2566cc) {
            throw _0x2a9112.VALUE;
          }
        } else if (Array.isArray(_0x367cbf)) {
          if (!_0x6cdf08) {
            if (_0x367cbf[0].length === 1) {
              _0x2566cc = this.acceptNumber(_0x367cbf[0][0]);
            } else {
              throw _0x2a9112.VALUE;
            }
          } else {
            _0x2566cc = this.acceptNumber(_0x367cbf[0][0]);
          }
        } else {
          throw Error("Unknown type in FormulaHelpers.acceptNumber");
        }
        return _0x2566cc;
      }
      flattenParams(_0x49a4b8, _0x263241, _0x5b3fd6, _0x2f48ec, _0x32ea35 = null, _0x2fe7b0 = 1) {
        if (_0x49a4b8.length < _0x2fe7b0) {
          throw _0x2a9112.ARG_MISSING([_0x263241]);
        }
        if (_0x32ea35 == null) {
          _0x32ea35 = _0x263241 === _0x38472c.NUMBER ? 0 : _0x263241 == null ? null : "";
        }
        _0x49a4b8.forEach(_0x1f41d1 => {
          const {
            isCellRef: _0x1ca6af,
            isRangeRef: _0x547818,
            isArray: _0x29704d
          } = _0x1f41d1;
          const _0x49bb90 = _0x1f41d1.value instanceof _0x5daef0;
          const _0x5eb66a = !_0x1ca6af && !_0x547818 && !_0x29704d && !_0x49bb90;
          var _0xeba36 = {
            isLiteral: _0x5eb66a,
            isCellRef: _0x1ca6af,
            isRangeRef: _0x547818,
            isArray: _0x29704d,
            isUnion: _0x49bb90
          };
          const _0x5be971 = _0xeba36;
          if (_0x5eb66a) {
            if (_0x1f41d1.omitted) {
              _0x1f41d1 = _0x32ea35;
            } else {
              _0x1f41d1 = this.accept(_0x1f41d1, _0x263241, _0x32ea35);
            }
            _0x2f48ec(_0x1f41d1, _0x5be971);
          } else if (_0x1ca6af) {
            _0x2f48ec(_0x1f41d1.value, _0x5be971);
          } else if (_0x49bb90) {
            if (!_0x5b3fd6) {
              throw _0x2a9112.VALUE;
            }
            _0x1f41d1 = _0x1f41d1.value.data;
            _0x1f41d1 = this.flattenDeep(_0x1f41d1);
            _0x1f41d1.forEach(_0x16ee7 => {
              _0x2f48ec(_0x16ee7, _0x5be971);
            });
          } else if (_0x547818 || _0x29704d) {
            _0x1f41d1 = this.flattenDeep(_0x1f41d1.value);
            _0x1f41d1.forEach(_0xb61853 => {
              _0x2f48ec(_0xb61853, _0x5be971);
            });
          }
        });
      }
      accept(_0x5e4e2c, _0xafb5a6 = null, _0x23fda3, _0x4a12a4 = true, _0x4601a4 = false) {
        if (Array.isArray(_0xafb5a6)) {
          _0xafb5a6 = _0xafb5a6[0];
        }
        if (_0x5e4e2c == null && _0x23fda3 === undefined) {
          throw _0x2a9112.ARG_MISSING([_0xafb5a6]);
        } else if (_0x5e4e2c == null) {
          return _0x23fda3;
        }
        if (typeof _0x5e4e2c !== "object" || Array.isArray(_0x5e4e2c)) {
          return _0x5e4e2c;
        }
        const _0x4ce30f = _0x5e4e2c.isArray;
        if (_0x5e4e2c.value != null) {
          _0x5e4e2c = _0x5e4e2c.value;
        }
        if (_0xafb5a6 == null) {
          return _0x5e4e2c;
        }
        if (_0x5e4e2c instanceof _0x2a9112) {
          throw _0x5e4e2c;
        }
        if (_0xafb5a6 === _0x38472c.ARRAY) {
          if (Array.isArray(_0x5e4e2c)) {
            if (_0x4a12a4) {
              return this.flattenDeep(_0x5e4e2c);
            } else {
              return _0x5e4e2c;
            }
          } else if (_0x5e4e2c instanceof _0x5daef0) {
            throw _0x2a9112.VALUE;
          } else if (_0x4601a4) {
            if (_0x4a12a4) {
              return [_0x5e4e2c];
            } else {
              return [[_0x5e4e2c]];
            }
          }
          throw _0x2a9112.VALUE;
        } else if (_0xafb5a6 === _0x38472c.COLLECTIONS) {
          return _0x5e4e2c;
        }
        if (_0x4ce30f) {
          _0x5e4e2c = _0x5e4e2c[0][0];
        }
        const _0x43b0a1 = this.type(_0x5e4e2c);
        if (_0xafb5a6 === _0x38472c.STRING) {
          if (_0x43b0a1 === _0x38472c.BOOLEAN) {
            _0x5e4e2c = _0x5e4e2c ? "TRUE" : "FALSE";
          } else {
            _0x5e4e2c = "" + _0x5e4e2c;
          }
        } else if (_0xafb5a6 === _0x38472c.BOOLEAN) {
          if (_0x43b0a1 === _0x38472c.STRING) {
            throw _0x2a9112.VALUE;
          }
          if (_0x43b0a1 === _0x38472c.NUMBER) {
            _0x5e4e2c = Boolean(_0x5e4e2c);
          }
        } else if (_0xafb5a6 === _0x38472c.NUMBER) {
          _0x5e4e2c = this.acceptNumber(_0x5e4e2c, false);
        } else if (_0xafb5a6 === _0x38472c.NUMBER_NO_BOOLEAN) {
          _0x5e4e2c = this.acceptNumber(_0x5e4e2c, false, false);
        } else {
          throw _0x2a9112.VALUE;
        }
        return _0x5e4e2c;
      }
      type(_0x303169) {
        let _0x3525f2 = this.type2Number[typeof _0x303169];
        if (_0x3525f2 === -1) {
          if (Array.isArray(_0x303169)) {
            _0x3525f2 = _0x38472c.ARRAY;
          } else if (_0x303169.ref) {
            if (_0x303169.ref.from) {
              _0x3525f2 = _0x38472c.RANGE_REF;
            } else {
              _0x3525f2 = _0x38472c.CELL_REF;
            }
          } else if (_0x303169 instanceof _0x5daef0) {
            _0x3525f2 = _0x38472c.COLLECTIONS;
          }
        }
        return _0x3525f2;
      }
      isRangeRef(_0x57546c) {
        return _0x57546c.ref && _0x57546c.ref.from;
      }
      isCellRef(_0x173e2d) {
        return _0x173e2d.ref && !_0x173e2d.ref.from;
      }
      retrieveRanges(_0x16ebd0, _0x51207e, _0x4d3de8) {
        _0x4d3de8 = _0x43b3f7.extend(_0x51207e, _0x4d3de8);
        _0x51207e = this.retrieveArg(_0x16ebd0, _0x51207e);
        _0x51207e = _0x2b12d0.accept(_0x51207e, _0x38472c.ARRAY, undefined, false, true);
        if (_0x4d3de8 !== _0x51207e) {
          _0x4d3de8 = this.retrieveArg(_0x16ebd0, _0x4d3de8);
          _0x4d3de8 = _0x2b12d0.accept(_0x4d3de8, _0x38472c.ARRAY, undefined, false, true);
        } else {
          _0x4d3de8 = _0x51207e;
        }
        return [_0x51207e, _0x4d3de8];
      }
      retrieveArg(_0x52d4f2, _0x5bf213) {
        if (_0x5bf213 === null) {
          return {
            value: 0,
            isArray: false,
            omitted: true
          };
        }
        const _0x250fec = _0x52d4f2.utils.extractRefValue(_0x5bf213);
        var _0x494ca5 = {
          value: _0x250fec.val,
          isArray: _0x250fec.isArray,
          ref: _0x5bf213.ref
        };
        return _0x494ca5;
      }
    };
    var _0x2b12d0 = new _0x4c1766();
    var _0x1731bd = {
      isWildCard: _0x3a9532 => {
        if (typeof _0x3a9532 === "string") {
          return /[*?]/.test(_0x3a9532);
        }
        return false;
      },
      toRegex: (_0x169310, _0x497a77) => {
        return RegExp(_0x169310.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/([^~]??)[?]/g, "$1.").replace(/([^~]??)[*]/g, "$1.*").replace(/~([?*])/g, "$1"), _0x497a77);
      }
    };
    var _0xaa296 = {
      parse: _0x3ae734 => {
        const _0x108d44 = typeof _0x3ae734;
        if (_0x108d44 === "string") {
          const _0x27c941 = _0x3ae734.toUpperCase();
          if (_0x27c941 === "TRUE" || _0x27c941 === "FALSE") {
            return {
              op: "=",
              value: _0x27c941 === "TRUE"
            };
          }
          const _0x31f1aa = _0x3ae734.match(/(<>|>=|<=|>|<|=)(.*)/);
          if (_0x31f1aa) {
            let _0x6cad2b = _0x31f1aa[1];
            let _0x11b87c;
            if (isNaN(_0x31f1aa[2])) {
              const _0x3b5a26 = _0x31f1aa[2].toUpperCase();
              if (_0x3b5a26 === "TRUE" || _0x3b5a26 === "FALSE") {
                _0x11b87c = _0x3b5a26 === "TRUE";
              } else if (/#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A|#REF!/.test(_0x31f1aa[2])) {
                _0x11b87c = new _0x2a9112(_0x31f1aa[2]);
              } else {
                _0x11b87c = _0x31f1aa[2];
                if (_0x1731bd.isWildCard(_0x11b87c)) {
                  return {
                    op: "wc",
                    value: _0x1731bd.toRegex(_0x11b87c),
                    match: _0x6cad2b === "="
                  };
                }
              }
            } else {
              _0x11b87c = Number(_0x31f1aa[2]);
            }
            var _0x4ca6d4 = {
              op: _0x6cad2b,
              value: _0x11b87c
            };
            return _0x4ca6d4;
          } else if (_0x1731bd.isWildCard(_0x3ae734)) {
            return {
              op: "wc",
              value: _0x1731bd.toRegex(_0x3ae734),
              match: true
            };
          } else {
            var _0x3c5e02 = {
              op: "=",
              value: _0x3ae734
            };
            return _0x3c5e02;
          }
        } else if (_0x108d44 === "boolean" || _0x108d44 === "number" || Array.isArray(_0x3ae734) || _0x3ae734 instanceof _0x2a9112) {
          var _0x59abf5 = {
            op: "=",
            value: _0x3ae734
          };
          return _0x59abf5;
        } else {
          throw Error("Criteria.parse: type " + typeof _0x3ae734 + " not support");
        }
      }
    };
    var _0x43b3f7 = {
      columnNumberToName: _0x18ac18 => {
        let _0x37963c = _0x18ac18;
        let _0x35a7b5 = "";
        let _0x2d5b03 = 0;
        while (_0x37963c > 0) {
          _0x2d5b03 = (_0x37963c - 1) % 26;
          _0x35a7b5 = String.fromCharCode("A".charCodeAt(0) + _0x2d5b03) + _0x35a7b5;
          _0x37963c = Math.floor((_0x37963c - _0x2d5b03) / 26);
        }
        return _0x35a7b5;
      },
      columnNameToNumber: _0x1dc713 => {
        _0x1dc713 = _0x1dc713.toUpperCase();
        const _0x3f947a = _0x1dc713.length;
        let _0x735af = 0;
        for (let _0x14fece = 0; _0x14fece < _0x3f947a; _0x14fece++) {
          const _0x364eef = _0x1dc713.charCodeAt(_0x14fece);
          if (!isNaN(_0x364eef)) {
            _0x735af += (_0x364eef - 64) * 26 ** (_0x3f947a - _0x14fece - 1);
          }
        }
        return _0x735af;
      },
      extend: (_0xfca324, _0x4a0c34) => {
        if (_0x4a0c34 == null) {
          return _0xfca324;
        }
        let _0x131c6d;
        let _0x57a46f;
        if (_0x2b12d0.isCellRef(_0xfca324)) {
          _0x131c6d = 0;
          _0x57a46f = 0;
        } else if (_0x2b12d0.isRangeRef(_0xfca324)) {
          _0x131c6d = _0xfca324.ref.to.row - _0xfca324.ref.from.row;
          _0x57a46f = _0xfca324.ref.to.col - _0xfca324.ref.from.col;
        } else {
          throw Error("Address.extend should not reach here.");
        }
        if (_0x2b12d0.isCellRef(_0x4a0c34)) {
          if (_0x131c6d > 0 || _0x57a46f > 0) {
            _0x4a0c34 = {
              ref: {
                from: {
                  col: _0x4a0c34.ref.col,
                  row: _0x4a0c34.ref.row
                },
                to: {
                  row: _0x4a0c34.ref.row + _0x131c6d,
                  col: _0x4a0c34.ref.col + _0x57a46f
                }
              }
            };
          }
        } else {
          _0x4a0c34.ref.to.row = _0x4a0c34.ref.from.row + _0x131c6d;
          _0x4a0c34.ref.to.col = _0x4a0c34.ref.from.col + _0x57a46f;
        }
        return _0x4a0c34;
      }
    };
    var _0x3cf878 = {
      FormulaHelpers: _0x2b12d0,
      Types: _0x38472c,
      ReversedTypes: _0xb5f9e7,
      Factorials: _0x2d6e5a,
      WildCard: _0x1731bd,
      Criteria: _0xaa296,
      Address: _0x43b3f7
    };
    _0x1562e.exports = _0x3cf878;
  }
});
var require_error = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/error.js"(_0x1084a3, _0x447418) {
    var _0xd485ef = class _0xd8278c extends Error {
      constructor(_0x37f782, _0x3dda1a, _0x3e43f4) {
        super(_0x3dda1a);
        if (_0x3dda1a == null && _0x3e43f4 == null && _0xd8278c.errorMap.has(_0x37f782)) {
          return _0xd8278c.errorMap.get(_0x37f782);
        } else if (_0x3dda1a == null && _0x3e43f4 == null) {
          this._error = _0x37f782;
          _0xd8278c.errorMap.set(_0x37f782, this);
        } else {
          this._error = _0x37f782;
        }
        this.details = _0x3e43f4;
      }
      get error() {
        return this._error;
      }
      get name() {
        return this._error;
      }
      equals(_0x13bd77) {
        return _0x13bd77 instanceof _0xd8278c && _0x13bd77._error === this._error;
      }
      toString() {
        return this._error;
      }
    };
    _0xd485ef.errorMap = new Map();
    _0xd485ef.DIV0 = new _0xd485ef("#DIV/0!");
    _0xd485ef.NA = new _0xd485ef("#N/A");
    _0xd485ef.NAME = new _0xd485ef("#NAME?");
    _0xd485ef.NULL = new _0xd485ef("#NULL!");
    _0xd485ef.NUM = new _0xd485ef("#NUM!");
    _0xd485ef.REF = new _0xd485ef("#REF!");
    _0xd485ef.VALUE = new _0xd485ef("#VALUE!");
    _0xd485ef.NOT_IMPLEMENTED = _0x2f863f => {
      return new _0xd485ef("#NAME?", "Function " + _0x2f863f + " is not implemented.");
    };
    _0xd485ef.TOO_MANY_ARGS = _0x3b7e5a => {
      return new _0xd485ef("#N/A", "Function " + _0x3b7e5a + " has too many arguments.");
    };
    _0xd485ef.ARG_MISSING = _0x1ccc1b => {
      const {
        Types: _0x3e730a
      } = require_helpers();
      return new _0xd485ef("#N/A", "Argument type " + _0x1ccc1b.map(_0x4dba89 => _0x3e730a[_0x4dba89]).join(", ") + " is missing.");
    };
    _0xd485ef.ERROR = (_0x5e3856, _0x197cdb) => {
      return new _0xd485ef("#ERROR!", _0x5e3856, _0x197cdb);
    };
    _0x447418.exports = _0xd485ef;
  }
});
var require_lexing = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/lexing.js"(_0x1f7f9b, _0x24324c) {
    var {
      createToken: _0x5548b0,
      Lexer: _0x262f43
    } = require("chevrotain");
    var _0x2539ff = require_error();
    var _0x42d898 = {};
    var _0x23a1df = _0x5548b0({
      name: "WhiteSpace",
      pattern: /\s+/,
      group: _0x262f43.SKIPPED
    });
    var _0x3b9bee = _0x5548b0({
      name: "String",
      pattern: /"(""|[^"])*"/
    });
    var _0x141f74 = _0x5548b0({
      name: "SingleQuotedString",
      pattern: /'(''|[^'])*'/
    });
    var _0x14b922 = _0x5548b0({
      name: "SheetQuoted",
      pattern: /'((?![\\\/\[\]*?:]).)+?'!/
    });
    var _0x47cd1e = _0x5548b0({
      name: "Function",
      pattern: /[A-Za-z_]+[A-Za-z_0-9.]*\(/
    });
    var _0x5dc4b3 = _0x5548b0({
      name: "FormulaErrorT",
      pattern: /#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A/
    });
    var _0x31f144 = _0x5548b0({
      name: "RefError",
      pattern: /#REF!/
    });
    var _0x252115 = _0x5548b0({
      name: "Name",
      pattern: /[a-zA-Z_][a-zA-Z0-9_.?]*/
    });
    var _0x4a7df2 = _0x5548b0({
      name: "Sheet",
      pattern: /[A-Za-z_.\d\u007F-\uFFFF]+!/
    });
    var _0x3a76f9 = _0x5548b0({
      name: "Cell",
      pattern: /[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/,
      longer_alt: _0x252115
    });
    var _0x28eaf7 = _0x5548b0({
      name: "Number",
      pattern: /[0-9]+[.]?[0-9]*([eE][+\-][0-9]+)?/
    });
    var _0x452147 = _0x5548b0({
      name: "Boolean",
      pattern: /TRUE|FALSE/i
    });
    var _0x4c9926 = _0x5548b0({
      name: "Column",
      pattern: /[$]?[A-Za-z]{1,3}/,
      longer_alt: _0x252115
    });
    var _0x54a74c = _0x5548b0({
      name: "At",
      pattern: /@/
    });
    var _0x3f1436 = _0x5548b0({
      name: "Comma",
      pattern: /,/
    });
    var _0x2e90c3 = _0x5548b0({
      name: "Colon",
      pattern: /:/
    });
    var _0x26b3c1 = _0x5548b0({
      name: "Semicolon",
      pattern: /;/
    });
    var _0x420ca3 = _0x5548b0({
      name: "OpenParen",
      pattern: /\(/
    });
    var _0x2c65c2 = _0x5548b0({
      name: "CloseParen",
      pattern: /\)/
    });
    var _0x54b1d1 = _0x5548b0({
      name: "OpenSquareParen",
      pattern: /\[/
    });
    var _0x3dd9bc = _0x5548b0({
      name: "CloseSquareParen",
      pattern: /]/
    });
    var _0x922955 = _0x5548b0({
      name: "exclamationMark",
      pattern: /!/
    });
    var _0x4e4f0d = _0x5548b0({
      name: "OpenCurlyParen",
      pattern: /{/
    });
    var _0x35a466 = _0x5548b0({
      name: "CloseCurlyParen",
      pattern: /}/
    });
    var _0x4d78a8 = _0x5548b0({
      name: "QuoteS",
      pattern: /'/
    });
    var _0x590536 = _0x5548b0({
      name: "MulOp",
      pattern: /\*/
    });
    var _0x5aefe0 = _0x5548b0({
      name: "PlusOp",
      pattern: /\+/
    });
    var _0xd4e448 = _0x5548b0({
      name: "DivOp",
      pattern: /\//
    });
    var _0x56b5d6 = _0x5548b0({
      name: "MinOp",
      pattern: /-/
    });
    var _0x3caeee = _0x5548b0({
      name: "ConcatOp",
      pattern: /&/
    });
    var _0xcf607c = _0x5548b0({
      name: "ExOp",
      pattern: /\^/
    });
    var _0x3321a4 = _0x5548b0({
      name: "PercentOp",
      pattern: /%/
    });
    var _0xd40125 = _0x5548b0({
      name: "GtOp",
      pattern: />/
    });
    var _0x41618b = _0x5548b0({
      name: "EqOp",
      pattern: /=/
    });
    var _0x4da2f3 = _0x5548b0({
      name: "LtOp",
      pattern: /</
    });
    var _0x4195c4 = _0x5548b0({
      name: "NeqOp",
      pattern: /<>/
    });
    var _0x4696b2 = _0x5548b0({
      name: "GteOp",
      pattern: />=/
    });
    var _0x27b90e = _0x5548b0({
      name: "LteOp",
      pattern: /<=/
    });
    var _0x4fef71 = [_0x23a1df, _0x3b9bee, _0x14b922, _0x141f74, _0x47cd1e, _0x5dc4b3, _0x31f144, _0x4a7df2, _0x3a76f9, _0x452147, _0x4c9926, _0x252115, _0x28eaf7, _0x54a74c, _0x3f1436, _0x2e90c3, _0x26b3c1, _0x420ca3, _0x2c65c2, _0x54b1d1, _0x3dd9bc, _0x4e4f0d, _0x35a466, _0x4d78a8, _0x590536, _0x5aefe0, _0xd4e448, _0x56b5d6, _0x3caeee, _0xcf607c, _0x590536, _0x3321a4, _0x4195c4, _0x4696b2, _0x27b90e, _0xd40125, _0x41618b, _0x4da2f3];
    var _0x3cc3ab = new _0x262f43(_0x4fef71, {
      ensureOptimizations: true
    });
    _0x4fef71.forEach(_0x8566a => {
      _0x42d898[_0x8566a.name] = _0x8566a;
    });
    _0x24324c.exports = {
      tokenVocabulary: _0x42d898,
      lex: function (_0x31114a) {
        const _0x3a7772 = _0x3cc3ab.tokenize(_0x31114a);
        if (_0x3a7772.errors.length > 0) {
          const _0x57b599 = _0x3a7772.errors[0];
          const _0xf9109a = _0x57b599.line;
          const _0x467b23 = _0x57b599.column;
          let _0x33f490 = "\n" + _0x31114a.split("\n")[_0xf9109a - 1] + "\n";
          _0x33f490 += Array(_0x467b23 - 1).fill(" ").join("") + "^\n";
          _0x57b599.message = _0x33f490 + ("Error at position " + _0xf9109a + ":" + _0x467b23 + "\n") + _0x57b599.message;
          var _0x2a4db5 = {
            line: _0xf9109a,
            column: _0x467b23
          };
          _0x57b599.errorLocation = _0x2a4db5;
          throw _0x2539ff.ERROR(_0x57b599.message, _0x57b599);
        }
        return _0x3a7772;
      }
    };
  }
});
var require_parsing = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/parsing.js"(_0x3f4ca4, _0x9c7cef) {
    var _0x1ee8c7 = require_lexing();
    var {
      EmbeddedActionsParser: _0x13c59a
    } = require("chevrotain");
    var _0xa147ea = _0x1ee8c7.tokenVocabulary;
    var {
      String: _0x456f4b,
      SheetQuoted: _0x516c60,
      ExcelRefFunction: _0x33928,
      ExcelConditionalRefFunction: _0x4a4dba,
      Function: _0x533b0a,
      FormulaErrorT: _0x324770,
      RefError: _0x5b84de,
      Cell: _0x29bb10,
      Sheet: _0x4e36e8,
      Name: _0x49a642,
      Number: _0x5a84ee,
      Boolean: _0x35308c,
      Column: _0x25ec58,
      Comma: _0x47a3cc,
      Colon: _0x1adf47,
      Semicolon: _0x813f3c,
      OpenParen: _0xea2f22,
      CloseParen: _0x58b3fb,
      OpenCurlyParen: _0x21f6da,
      CloseCurlyParen: _0x669669,
      MulOp: _0x98be96,
      PlusOp: _0x2eba9c,
      DivOp: _0x32e555,
      MinOp: _0x55186b,
      ConcatOp: _0x12a487,
      ExOp: _0xc189cd,
      PercentOp: _0x443b40,
      NeqOp: _0x59969a,
      GteOp: _0x3e8004,
      LteOp: _0x1b8387,
      GtOp: _0x1c34db,
      EqOp: _0x5ecf26,
      LtOp: _0xa298ac
    } = _0x1ee8c7.tokenVocabulary;
    var _0x47587f = class extends _0x13c59a {
      constructor(_0x39adc8, _0x4e0a02) {
        super(_0xa147ea, {
          outputCst: false,
          maxLookahead: 1,
          skipValidations: true
        });
        this.utils = _0x4e0a02;
        this.binaryOperatorsPrecedence = [["^"], ["*", "/"], ["+", "-"], ["&"], ["<", ">", "=", "<>", "<=", ">="]];
        const _0x22c788 = this;
        _0x22c788.RULE("formulaWithBinaryOp", () => {
          const _0x164568 = [];
          const _0x29fa41 = [_0x22c788.SUBRULE(_0x22c788.formulaWithPercentOp)];
          _0x22c788.MANY(() => {
            _0x164568.push(_0x22c788.OR(_0x22c788.c1 ||= [{
              ALT: () => _0x22c788.CONSUME(_0x1c34db).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x5ecf26).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0xa298ac).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x59969a).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x3e8004).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x1b8387).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x12a487).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x2eba9c).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x55186b).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x98be96).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x32e555).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0xc189cd).image
            }]));
            _0x29fa41.push(_0x22c788.SUBRULE2(_0x22c788.formulaWithPercentOp));
          });
          _0x22c788.ACTION(() => {
            for (const _0x4fa91d of this.binaryOperatorsPrecedence) {
              for (let _0x56f64e = 0, _0x4dc586 = _0x164568.length; _0x56f64e < _0x4dc586; _0x56f64e++) {
                const _0x22f182 = _0x164568[_0x56f64e];
                if (!_0x4fa91d.includes(_0x22f182)) {
                  continue;
                }
                _0x164568.splice(_0x56f64e, 1);
                _0x29fa41.splice(_0x56f64e, 2, this.utils.applyInfix(_0x29fa41[_0x56f64e], _0x22f182, _0x29fa41[_0x56f64e + 1]));
                _0x56f64e--;
                _0x4dc586--;
              }
            }
          });
          return _0x29fa41[0];
        });
        _0x22c788.RULE("plusMinusOp", () => _0x22c788.OR([{
          ALT: () => _0x22c788.CONSUME(_0x2eba9c).image
        }, {
          ALT: () => _0x22c788.CONSUME(_0x55186b).image
        }]));
        _0x22c788.RULE("formulaWithPercentOp", () => {
          let _0x4833fd = _0x22c788.SUBRULE(_0x22c788.formulaWithUnaryOp);
          _0x22c788.OPTION(() => {
            const _0x14b51a = _0x22c788.CONSUME(_0x443b40).image;
            _0x4833fd = _0x22c788.ACTION(() => this.utils.applyPostfix(_0x4833fd, _0x14b51a));
          });
          return _0x4833fd;
        });
        _0x22c788.RULE("formulaWithUnaryOp", () => {
          const _0x29af74 = [];
          _0x22c788.MANY(() => {
            const _0x51010c = _0x22c788.OR([{
              ALT: () => _0x22c788.CONSUME(_0x2eba9c).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x55186b).image
            }]);
            _0x29af74.push(_0x51010c);
          });
          const _0x404d6f = _0x22c788.SUBRULE(_0x22c788.formulaWithIntersect);
          if (_0x29af74.length > 0) {
            return _0x22c788.ACTION(() => this.utils.applyPrefix(_0x29af74, _0x404d6f));
          }
          return _0x404d6f;
        });
        _0x22c788.RULE("formulaWithIntersect", () => {
          let _0x4f6823 = _0x22c788.SUBRULE(_0x22c788.formulaWithRange);
          const _0xc7fb94 = [_0x4f6823];
          _0x22c788.MANY({
            GATE: () => {
              const _0x2936c6 = _0x22c788.LA(0);
              const _0x46f786 = _0x22c788.LA(1);
              return _0x46f786.startOffset > _0x2936c6.endOffset + 1;
            },
            DEF: () => {
              _0xc7fb94.push(_0x22c788.SUBRULE3(_0x22c788.formulaWithRange));
            }
          });
          if (_0xc7fb94.length > 1) {
            return _0x22c788.ACTION(() => _0x22c788.ACTION(() => this.utils.applyIntersect(_0xc7fb94)));
          }
          return _0x4f6823;
        });
        _0x22c788.RULE("formulaWithRange", () => {
          const _0x414489 = _0x22c788.SUBRULE(_0x22c788.formula);
          const _0x4b0121 = [_0x414489];
          _0x22c788.MANY(() => {
            _0x22c788.CONSUME(_0x1adf47);
            _0x4b0121.push(_0x22c788.SUBRULE2(_0x22c788.formula));
          });
          if (_0x4b0121.length > 1) {
            return _0x22c788.ACTION(() => _0x22c788.ACTION(() => this.utils.applyRange(_0x4b0121)));
          }
          return _0x414489;
        });
        _0x22c788.RULE("formula", () => _0x22c788.OR9([{
          ALT: () => _0x22c788.SUBRULE(_0x22c788.referenceWithoutInfix)
        }, {
          ALT: () => _0x22c788.SUBRULE(_0x22c788.paren)
        }, {
          ALT: () => _0x22c788.SUBRULE(_0x22c788.constant)
        }, {
          ALT: () => _0x22c788.SUBRULE(_0x22c788.functionCall)
        }, {
          ALT: () => _0x22c788.SUBRULE(_0x22c788.constantArray)
        }]));
        _0x22c788.RULE("paren", () => {
          _0x22c788.CONSUME(_0xea2f22);
          let _0xeed8a8;
          const _0x393f41 = [];
          _0x393f41.push(_0x22c788.SUBRULE(_0x22c788.formulaWithBinaryOp));
          _0x22c788.MANY(() => {
            _0x22c788.CONSUME(_0x47a3cc);
            _0x393f41.push(_0x22c788.SUBRULE2(_0x22c788.formulaWithBinaryOp));
          });
          if (_0x393f41.length > 1) {
            _0xeed8a8 = _0x22c788.ACTION(() => this.utils.applyUnion(_0x393f41));
          } else {
            _0xeed8a8 = _0x393f41[0];
          }
          _0x22c788.CONSUME(_0x58b3fb);
          return _0xeed8a8;
        });
        _0x22c788.RULE("constantArray", () => {
          const _0x26b00d = [[]];
          let _0x30699a = 0;
          _0x22c788.CONSUME(_0x21f6da);
          _0x26b00d[_0x30699a].push(_0x22c788.SUBRULE(_0x22c788.constantForArray));
          _0x22c788.MANY(() => {
            const _0x1428d4 = _0x22c788.OR([{
              ALT: () => _0x22c788.CONSUME(_0x47a3cc).image
            }, {
              ALT: () => _0x22c788.CONSUME(_0x813f3c).image
            }]);
            const _0x58e697 = _0x22c788.SUBRULE2(_0x22c788.constantForArray);
            if (_0x1428d4 === ",") {
              _0x26b00d[_0x30699a].push(_0x58e697);
            } else {
              _0x30699a++;
              _0x26b00d[_0x30699a] = [];
              _0x26b00d[_0x30699a].push(_0x58e697);
            }
          });
          _0x22c788.CONSUME(_0x669669);
          return _0x22c788.ACTION(() => this.utils.toArray(_0x26b00d));
        });
        _0x22c788.RULE("constantForArray", () => _0x22c788.OR([{
          ALT: () => {
            const _0x2c4d53 = _0x22c788.OPTION(() => _0x22c788.SUBRULE(_0x22c788.plusMinusOp));
            const _0x59c611 = _0x22c788.CONSUME(_0x5a84ee).image;
            const _0x545939 = _0x22c788.ACTION(() => this.utils.toNumber(_0x59c611));
            if (_0x2c4d53) {
              return _0x22c788.ACTION(() => this.utils.applyPrefix([_0x2c4d53], _0x545939));
            }
            return _0x545939;
          }
        }, {
          ALT: () => {
            const _0x3db20e = _0x22c788.CONSUME(_0x456f4b).image;
            return _0x22c788.ACTION(() => this.utils.toString(_0x3db20e));
          }
        }, {
          ALT: () => {
            const _0x426410 = _0x22c788.CONSUME(_0x35308c).image;
            return _0x22c788.ACTION(() => this.utils.toBoolean(_0x426410));
          }
        }, {
          ALT: () => {
            const _0x52690a = _0x22c788.CONSUME(_0x324770).image;
            return _0x22c788.ACTION(() => this.utils.toError(_0x52690a));
          }
        }, {
          ALT: () => {
            const _0x33ea4a = _0x22c788.CONSUME(_0x5b84de).image;
            return _0x22c788.ACTION(() => this.utils.toError(_0x33ea4a));
          }
        }]));
        _0x22c788.RULE("constant", () => _0x22c788.OR([{
          ALT: () => {
            const _0x38d88c = _0x22c788.CONSUME(_0x5a84ee).image;
            return _0x22c788.ACTION(() => this.utils.toNumber(_0x38d88c));
          }
        }, {
          ALT: () => {
            const _0x525d82 = _0x22c788.CONSUME(_0x456f4b).image;
            return _0x22c788.ACTION(() => this.utils.toString(_0x525d82));
          }
        }, {
          ALT: () => {
            const _0x2792e7 = _0x22c788.CONSUME(_0x35308c).image;
            return _0x22c788.ACTION(() => this.utils.toBoolean(_0x2792e7));
          }
        }, {
          ALT: () => {
            const _0x27d9dc = _0x22c788.CONSUME(_0x324770).image;
            return _0x22c788.ACTION(() => this.utils.toError(_0x27d9dc));
          }
        }]));
        _0x22c788.RULE("functionCall", () => {
          const _0xeb8e7a = _0x22c788.CONSUME(_0x533b0a).image.slice(0, -1);
          const _0x3847da = _0x22c788.SUBRULE(_0x22c788.arguments);
          _0x22c788.CONSUME(_0x58b3fb);
          return _0x22c788.ACTION(() => _0x39adc8.callFunction(_0xeb8e7a, _0x3847da));
        });
        _0x22c788.RULE("arguments", () => {
          _0x22c788.MANY2(() => {
            _0x22c788.CONSUME2(_0x47a3cc);
          });
          const _0x2b784e = [];
          _0x22c788.OPTION(() => {
            _0x2b784e.push(_0x22c788.SUBRULE(_0x22c788.formulaWithBinaryOp));
            _0x22c788.MANY(() => {
              _0x22c788.CONSUME1(_0x47a3cc);
              _0x2b784e.push(null);
              _0x22c788.OPTION3(() => {
                _0x2b784e.pop();
                _0x2b784e.push(_0x22c788.SUBRULE2(_0x22c788.formulaWithBinaryOp));
              });
            });
          });
          return _0x2b784e;
        });
        _0x22c788.RULE("referenceWithoutInfix", () => _0x22c788.OR([{
          ALT: () => _0x22c788.SUBRULE(_0x22c788.referenceItem)
        }, {
          ALT: () => {
            const _0x49bdd8 = _0x22c788.SUBRULE(_0x22c788.prefixName);
            const _0x3722d6 = _0x22c788.SUBRULE2(_0x22c788.formulaWithRange);
            _0x22c788.ACTION(() => {
              if (this.utils.isFormulaError(_0x3722d6)) {
                return _0x3722d6;
              }
              _0x3722d6.ref.sheet = _0x49bdd8;
            });
            return _0x3722d6;
          }
        }]));
        _0x22c788.RULE("referenceItem", () => _0x22c788.OR([{
          ALT: () => {
            const _0x44af77 = _0x22c788.CONSUME(_0x29bb10).image;
            return _0x22c788.ACTION(() => this.utils.parseCellAddress(_0x44af77));
          }
        }, {
          ALT: () => {
            const _0x5184e7 = _0x22c788.CONSUME(_0x49a642).image;
            return _0x22c788.ACTION(() => _0x39adc8.getVariable(_0x5184e7));
          }
        }, {
          ALT: () => {
            const _0x4609cc = _0x22c788.CONSUME(_0x25ec58).image;
            return _0x22c788.ACTION(() => this.utils.parseCol(_0x4609cc));
          }
        }, {
          ALT: () => {
            const _0x671672 = _0x22c788.CONSUME(_0x5b84de).image;
            return _0x22c788.ACTION(() => this.utils.toError(_0x671672));
          }
        }]));
        _0x22c788.RULE("prefixName", () => _0x22c788.OR([{
          ALT: () => _0x22c788.CONSUME(_0x4e36e8).image.slice(0, -1)
        }, {
          ALT: () => _0x22c788.CONSUME(_0x516c60).image.slice(1, -2).replace(/''/g, "'")
        }]));
        this.performSelfAnalysis();
      }
    };
    var _0x48a573 = {
      Parser: _0x47587f
    };
    _0x9c7cef.exports = _0x48a573;
  }
});
var require_operators = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/operators.js"(_0x12ccd2, _0x3fb925) {
    var _0x497d65 = require_error();
    var {
      FormulaHelpers: _0x40a932
    } = require_helpers();
    var _0x49200e = {
      unaryOp: (_0x192edb, _0x1016fd, _0xa7673c) => {
        let _0xf55f9b = 1;
        _0x192edb.forEach(_0x26f732 => {
          if (_0x26f732 === "+") {} else if (_0x26f732 === "-") {
            _0xf55f9b = -_0xf55f9b;
          } else {
            throw new Error("Unrecognized prefix: " + _0x26f732);
          }
        });
        if (_0x1016fd == null) {
          _0x1016fd = 0;
        }
        if (_0xf55f9b === 1) {
          return _0x1016fd;
        }
        try {
          _0x1016fd = _0x40a932.acceptNumber(_0x1016fd, _0xa7673c);
        } catch (_0x4889de) {
          if (_0x4889de instanceof _0x497d65) {
            if (Array.isArray(_0x1016fd)) {
              _0x1016fd = _0x1016fd[0][0];
            }
          } else {
            throw _0x4889de;
          }
        }
        if (typeof _0x1016fd === "number" && isNaN(_0x1016fd)) {
          return _0x497d65.VALUE;
        }
        return -_0x1016fd;
      }
    };
    var _0x291c14 = {
      percentOp: (_0x1e83b5, _0x2ea27b, _0x1e31d9) => {
        try {
          _0x1e83b5 = _0x40a932.acceptNumber(_0x1e83b5, _0x1e31d9);
        } catch (_0x3b6f91) {
          if (_0x3b6f91 instanceof _0x497d65) {
            return _0x3b6f91;
          }
          throw _0x3b6f91;
        }
        if (_0x2ea27b === "%") {
          return _0x1e83b5 / 100;
        }
        throw new Error("Unrecognized postfix: " + _0x2ea27b);
      }
    };
    var _0x32b9cc = {
      boolean: 3,
      string: 2,
      number: 1
    };
    var _0x37f331 = {
      compareOp: (_0x354e94, _0x49f710, _0x39d976, _0x5ebbeb, _0x108337) => {
        if (_0x354e94 == null) {
          _0x354e94 = 0;
        }
        if (_0x39d976 == null) {
          _0x39d976 = 0;
        }
        if (_0x5ebbeb) {
          _0x354e94 = _0x354e94[0][0];
        }
        if (_0x108337) {
          _0x39d976 = _0x39d976[0][0];
        }
        const _0x55cd10 = typeof _0x354e94;
        const _0x228b62 = typeof _0x39d976;
        if (_0x55cd10 === _0x228b62) {
          switch (_0x49f710) {
            case "=":
              return _0x354e94 === _0x39d976;
            case ">":
              return _0x354e94 > _0x39d976;
            case "<":
              return _0x354e94 < _0x39d976;
            case "<>":
              return _0x354e94 !== _0x39d976;
            case "<=":
              return _0x354e94 <= _0x39d976;
            case ">=":
              return _0x354e94 >= _0x39d976;
          }
        } else {
          switch (_0x49f710) {
            case "=":
              return false;
            case ">":
              return _0x32b9cc[_0x55cd10] > _0x32b9cc[_0x228b62];
            case "<":
              return _0x32b9cc[_0x55cd10] < _0x32b9cc[_0x228b62];
            case "<>":
              return true;
            case "<=":
              return _0x32b9cc[_0x55cd10] <= _0x32b9cc[_0x228b62];
            case ">=":
              return _0x32b9cc[_0x55cd10] >= _0x32b9cc[_0x228b62];
          }
        }
        throw Error("Infix.compareOp: Should not reach here.");
      },
      concatOp: (_0x34491e, _0xfe7e4a, _0xe85786, _0x26d10d, _0x3161ce) => {
        if (_0x34491e == null) {
          _0x34491e = "";
        }
        if (_0xe85786 == null) {
          _0xe85786 = "";
        }
        if (_0x26d10d) {
          _0x34491e = _0x34491e[0][0];
        }
        if (_0x3161ce) {
          _0xe85786 = _0xe85786[0][0];
        }
        const _0x5bd814 = typeof _0x34491e;
        const _0x1f2b1c = typeof _0xe85786;
        if (_0x5bd814 === "boolean") {
          _0x34491e = _0x34491e ? "TRUE" : "FALSE";
        }
        if (_0x1f2b1c === "boolean") {
          _0xe85786 = _0xe85786 ? "TRUE" : "FALSE";
        }
        return "" + _0x34491e + _0xe85786;
      },
      mathOp: (_0x475f3f, _0x9c4f70, _0x1934d9, _0x4a82ef, _0x51dd35) => {
        if (_0x475f3f == null) {
          _0x475f3f = 0;
        }
        if (_0x1934d9 == null) {
          _0x1934d9 = 0;
        }
        try {
          _0x475f3f = _0x40a932.acceptNumber(_0x475f3f, _0x4a82ef);
          _0x1934d9 = _0x40a932.acceptNumber(_0x1934d9, _0x51dd35);
        } catch (_0x3923fc) {
          if (_0x3923fc instanceof _0x497d65) {
            return _0x3923fc;
          }
          throw _0x3923fc;
        }
        switch (_0x9c4f70) {
          case "+":
            return _0x475f3f + _0x1934d9;
          case "-":
            return _0x475f3f - _0x1934d9;
          case "*":
            return _0x475f3f * _0x1934d9;
          case "/":
            if (_0x1934d9 === 0) {
              return _0x497d65.DIV0;
            }
            return _0x475f3f / _0x1934d9;
          case "^":
            return _0x475f3f ** _0x1934d9;
        }
        throw Error("Infix.mathOp: Should not reach here.");
      }
    };
    var _0x3c5821 = {
      Prefix: _0x49200e,
      Postfix: _0x291c14,
      Infix: _0x37f331,
      Operators: {
        compareOp: ["<", ">", "=", "<>", "<=", ">="],
        concatOp: ["&"],
        mathOp: ["+", "-", "*", "/", "^"]
      }
    };
    _0x3fb925.exports = _0x3c5821;
  }
});
var require_utils = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js"(_0x5ebcd1, _0x1ad880) {
    var _0x4cb827 = require_error();
    var {
      FormulaHelpers: _0x329f0e,
      Types: _0x2719c8,
      Address: _0x5876c0
    } = require_helpers();
    var {
      Prefix: _0x25cfe3,
      Postfix: _0x47f471,
      Infix: _0x593bf4,
      Operators: _0x238631
    } = require_operators();
    var _0x38dca6 = require_collection();
    var _0xd97043 = 1048576;
    var _0x42dffe = 16384;
    var _0x10b14d = class {
      constructor(_0x35aeeb) {
        this.context = _0x35aeeb;
      }
      columnNameToNumber(_0x50d5fb) {
        return _0x5876c0.columnNameToNumber(_0x50d5fb);
      }
      parseCellAddress(_0x51a11d) {
        const _0x4cb9e8 = _0x51a11d.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
        return {
          ref: {
            col: this.columnNameToNumber(_0x4cb9e8[2]),
            row: +_0x4cb9e8[4]
          }
        };
      }
      parseRow(_0x52bff3) {
        const _0x4ddc7b = +_0x52bff3;
        if (!Number.isInteger(_0x4ddc7b)) {
          throw Error("Row number must be integer.");
        }
        var _0x10b334 = {
          col: undefined,
          row: +_0x52bff3
        };
        var _0x476fa1 = {
          ref: _0x10b334
        };
        return _0x476fa1;
      }
      parseCol(_0x396e32) {
        return {
          ref: {
            col: this.columnNameToNumber(_0x396e32),
            row: undefined
          }
        };
      }
      applyPrefix(_0x43c90a, _0x23278c) {
        this.extractRefValue(_0x23278c);
        return 0;
      }
      applyPostfix(_0x21e03f, _0x4beb79) {
        this.extractRefValue(_0x21e03f);
        return 0;
      }
      applyInfix(_0x14fe2f, _0x45dee1, _0x1638cd) {
        this.extractRefValue(_0x14fe2f);
        this.extractRefValue(_0x1638cd);
        return 0;
      }
      applyIntersect(_0x1b4327) {
        if (this.isFormulaError(_0x1b4327[0])) {
          return _0x1b4327[0];
        }
        if (!_0x1b4327[0].ref) {
          throw Error("Expecting a reference, but got " + _0x1b4327[0] + ".");
        }
        let _0x24615d;
        let _0x27f9ff;
        let _0x5d0d13;
        let _0x17d827;
        let _0x568e55;
        let _0x581276;
        const _0x3f3d48 = _0x1b4327.shift().ref;
        _0x568e55 = _0x3f3d48.sheet;
        if (!_0x3f3d48.from) {
          if (_0x3f3d48.row === undefined || _0x3f3d48.col === undefined) {
            throw Error("Cannot intersect the whole row or column.");
          }
          _0x24615d = _0x5d0d13 = _0x3f3d48.row;
          _0x27f9ff = _0x17d827 = _0x3f3d48.col;
        } else {
          _0x24615d = Math.max(_0x3f3d48.from.row, _0x3f3d48.to.row);
          _0x5d0d13 = Math.min(_0x3f3d48.from.row, _0x3f3d48.to.row);
          _0x27f9ff = Math.max(_0x3f3d48.from.col, _0x3f3d48.to.col);
          _0x17d827 = Math.min(_0x3f3d48.from.col, _0x3f3d48.to.col);
        }
        let _0x46855e;
        _0x1b4327.forEach(_0x4460bf => {
          if (this.isFormulaError(_0x4460bf)) {
            return _0x4460bf;
          }
          _0x4460bf = _0x4460bf.ref;
          if (!_0x4460bf) {
            throw Error("Expecting a reference, but got " + _0x4460bf + ".");
          }
          if (!_0x4460bf.from) {
            if (_0x4460bf.row === undefined || _0x4460bf.col === undefined) {
              throw Error("Cannot intersect the whole row or column.");
            }
            if (_0x4460bf.row > _0x24615d || _0x4460bf.row < _0x5d0d13 || _0x4460bf.col > _0x27f9ff || _0x4460bf.col < _0x17d827 || _0x568e55 !== _0x4460bf.sheet) {
              _0x46855e = _0x4cb827.NULL;
            }
            _0x24615d = _0x5d0d13 = _0x4460bf.row;
            _0x27f9ff = _0x17d827 = _0x4460bf.col;
          } else {
            const _0x791fab = Math.max(_0x4460bf.from.row, _0x4460bf.to.row);
            const _0xa13a79 = Math.min(_0x4460bf.from.row, _0x4460bf.to.row);
            const _0x45c5d1 = Math.max(_0x4460bf.from.col, _0x4460bf.to.col);
            const _0x2a3045 = Math.min(_0x4460bf.from.col, _0x4460bf.to.col);
            if (_0xa13a79 > _0x24615d || _0x791fab < _0x5d0d13 || _0x2a3045 > _0x27f9ff || _0x45c5d1 < _0x17d827 || _0x568e55 !== _0x4460bf.sheet) {
              _0x46855e = _0x4cb827.NULL;
            }
            _0x24615d = Math.min(_0x24615d, _0x791fab);
            _0x5d0d13 = Math.max(_0x5d0d13, _0xa13a79);
            _0x27f9ff = Math.min(_0x27f9ff, _0x45c5d1);
            _0x17d827 = Math.max(_0x17d827, _0x2a3045);
          }
        });
        if (_0x46855e) {
          return _0x46855e;
        }
        if (_0x24615d === _0x5d0d13 && _0x27f9ff === _0x17d827) {
          var _0x41adda = {
            sheet: _0x568e55,
            row: _0x24615d,
            col: _0x27f9ff
          };
          var _0x510084 = {
            ref: _0x41adda
          };
          _0x581276 = _0x510084;
        } else {
          var _0x20cc3e = {
            row: _0x5d0d13,
            col: _0x17d827
          };
          var _0x500f08 = {
            row: _0x24615d,
            col: _0x27f9ff
          };
          var _0x2fc9eb = {
            sheet: _0x568e55,
            from: _0x20cc3e,
            to: _0x500f08
          };
          var _0xe023ba = {
            ref: _0x2fc9eb
          };
          _0x581276 = _0xe023ba;
        }
        if (!_0x581276.ref.sheet) {
          delete _0x581276.ref.sheet;
        }
        return _0x581276;
      }
      applyUnion(_0x15f1d2) {
        const _0x39e082 = new _0x38dca6();
        for (let _0x5a9f84 = 0; _0x5a9f84 < _0x15f1d2.length; _0x5a9f84++) {
          if (this.isFormulaError(_0x15f1d2[_0x5a9f84])) {
            return _0x15f1d2[_0x5a9f84];
          }
          _0x39e082.add(this.extractRefValue(_0x15f1d2[_0x5a9f84]).val, _0x15f1d2[_0x5a9f84]);
        }
        return _0x39e082;
      }
      applyRange(_0x521ed2) {
        let _0x1caa47;
        let _0x589625 = -1;
        let _0x4e0a4d = -1;
        let _0x615d87 = _0xd97043 + 1;
        let _0x6f563f = _0x42dffe + 1;
        _0x521ed2.forEach(_0xc00a1 => {
          if (this.isFormulaError(_0xc00a1)) {
            return _0xc00a1;
          }
          if (typeof _0xc00a1 === "number") {
            _0xc00a1 = this.parseRow(_0xc00a1);
          }
          _0xc00a1 = _0xc00a1.ref;
          if (_0xc00a1.row === undefined) {
            _0x615d87 = 1;
            _0x589625 = _0xd97043;
          }
          if (_0xc00a1.col === undefined) {
            _0x6f563f = 1;
            _0x4e0a4d = _0x42dffe;
          }
          if (_0xc00a1.row > _0x589625) {
            _0x589625 = _0xc00a1.row;
          }
          if (_0xc00a1.row < _0x615d87) {
            _0x615d87 = _0xc00a1.row;
          }
          if (_0xc00a1.col > _0x4e0a4d) {
            _0x4e0a4d = _0xc00a1.col;
          }
          if (_0xc00a1.col < _0x6f563f) {
            _0x6f563f = _0xc00a1.col;
          }
        });
        if (_0x589625 === _0x615d87 && _0x4e0a4d === _0x6f563f) {
          var _0x3b38c9 = {
            row: _0x589625,
            col: _0x4e0a4d
          };
          var _0x46a166 = {
            ref: _0x3b38c9
          };
          _0x1caa47 = _0x46a166;
        } else {
          var _0x3439fb = {
            row: _0x615d87,
            col: _0x6f563f
          };
          var _0x2a908c = {
            row: _0x589625,
            col: _0x4e0a4d
          };
          var _0x1cfc0f = {
            from: _0x3439fb,
            to: _0x2a908c
          };
          var _0x1cce6c = {
            ref: _0x1cfc0f
          };
          _0x1caa47 = _0x1cce6c;
        }
        return _0x1caa47;
      }
      extractRefValue(_0x49db72) {
        const _0x4d602f = Array.isArray(_0x49db72);
        if (_0x49db72.ref) {
          return {
            val: this.context.retrieveRef(_0x49db72),
            isArray: _0x4d602f
          };
        }
        var _0x1ae91f = {
          val: _0x49db72,
          isArray: _0x4d602f
        };
        return _0x1ae91f;
      }
      toArray(_0x5dff4e) {
        return _0x5dff4e;
      }
      toNumber(_0x3e2498) {
        return Number(_0x3e2498);
      }
      toString(_0x56826d) {
        return _0x56826d.substring(1, _0x56826d.length - 1).replace(/""/g, "\"");
      }
      toBoolean(_0x3467c1) {
        return _0x3467c1 === "TRUE";
      }
      toError(_0xf3cc63) {
        return new _0x4cb827(_0xf3cc63.toUpperCase());
      }
      isFormulaError(_0x11ca87) {
        return _0x11ca87 instanceof _0x4cb827;
      }
    };
    _0x1ad880.exports = _0x10b14d;
  }
});
var require_utils2 = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/utils.js"(_0x5dc969, _0x18d0c7) {
    var _0x410173 = require_error();
    var {
      Address: _0xdf5623
    } = require_helpers();
    var {
      Prefix: _0x14d9dd,
      Postfix: _0x3935c6,
      Infix: _0x4f9887,
      Operators: _0xd7ad3
    } = require_operators();
    var _0x8440c9 = require_collection();
    var _0x305ff9 = 1048576;
    var _0x463129 = 16384;
    var {
      NotAllInputParsedException: _0x884fb8
    } = require("chevrotain");
    var _0x29b713 = class {
      constructor(_0x34a7d5) {
        this.context = _0x34a7d5;
      }
      columnNameToNumber(_0x37b88b) {
        return _0xdf5623.columnNameToNumber(_0x37b88b);
      }
      parseCellAddress(_0x55b323) {
        const _0x4e63f6 = _0x55b323.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
        return {
          ref: {
            address: _0x4e63f6[0],
            col: this.columnNameToNumber(_0x4e63f6[2]),
            row: +_0x4e63f6[4]
          }
        };
      }
      parseRow(_0x2b955e) {
        const _0xe051dc = +_0x2b955e;
        if (!Number.isInteger(_0xe051dc)) {
          throw Error("Row number must be integer.");
        }
        var _0x5ccc0b = {
          col: undefined,
          row: +_0x2b955e
        };
        var _0x367771 = {
          ref: _0x5ccc0b
        };
        return _0x367771;
      }
      parseCol(_0x8c7c3a) {
        return {
          ref: {
            col: this.columnNameToNumber(_0x8c7c3a),
            row: undefined
          }
        };
      }
      parseColRange(_0x132996, _0x259764) {
        _0x132996 = this.columnNameToNumber(_0x132996);
        _0x259764 = this.columnNameToNumber(_0x259764);
        return {
          ref: {
            from: {
              col: Math.min(_0x132996, _0x259764),
              row: null
            },
            to: {
              col: Math.max(_0x132996, _0x259764),
              row: null
            }
          }
        };
      }
      parseRowRange(_0x481c33, _0x4aa680) {
        return {
          ref: {
            from: {
              col: null,
              row: Math.min(_0x481c33, _0x4aa680)
            },
            to: {
              col: null,
              row: Math.max(_0x481c33, _0x4aa680)
            }
          }
        };
      }
      _applyPrefix(_0x120d08, _0x201a75, _0x516a6a) {
        if (this.isFormulaError(_0x201a75)) {
          return _0x201a75;
        }
        return _0x14d9dd.unaryOp(_0x120d08, _0x201a75, _0x516a6a);
      }
      async applyPrefixAsync(_0x44f932, _0x22d871) {
        const {
          val: _0x125f53,
          isArray: _0x432c2e
        } = this.extractRefValue(await _0x22d871);
        return this._applyPrefix(_0x44f932, _0x125f53, _0x432c2e);
      }
      applyPrefix(_0x106d1a, _0x115d03) {
        if (this.context.async) {
          return this.applyPrefixAsync(_0x106d1a, _0x115d03);
        } else {
          const {
            val: _0x2f0d97,
            isArray: _0x1d6ea1
          } = this.extractRefValue(_0x115d03);
          return this._applyPrefix(_0x106d1a, _0x2f0d97, _0x1d6ea1);
        }
      }
      _applyPostfix(_0x588855, _0x51dc13, _0xaf582e) {
        if (this.isFormulaError(_0x588855)) {
          return _0x588855;
        }
        return _0x3935c6.percentOp(_0x588855, _0xaf582e, _0x51dc13);
      }
      async applyPostfixAsync(_0x3f7b2a, _0x12a5c1) {
        const {
          val: _0x1ac699,
          isArray: _0x4b988f
        } = this.extractRefValue(await _0x3f7b2a);
        return this._applyPostfix(_0x1ac699, _0x4b988f, _0x12a5c1);
      }
      applyPostfix(_0x1922af, _0x49ded0) {
        if (this.context.async) {
          return this.applyPostfixAsync(_0x1922af, _0x49ded0);
        } else {
          const {
            val: _0x1601ad,
            isArray: _0x4a6ed6
          } = this.extractRefValue(_0x1922af);
          return this._applyPostfix(_0x1601ad, _0x4a6ed6, _0x49ded0);
        }
      }
      _applyInfix(_0x5a5077, _0x195108, _0x67fbc3) {
        const _0x3f88d6 = _0x5a5077.val;
        const _0x3716ac = _0x5a5077.isArray;
        const _0x4523c6 = _0x67fbc3.val;
        const _0x417b97 = _0x67fbc3.isArray;
        if (this.isFormulaError(_0x3f88d6)) {
          return _0x3f88d6;
        }
        if (this.isFormulaError(_0x4523c6)) {
          return _0x4523c6;
        }
        if (_0xd7ad3.compareOp.includes(_0x195108)) {
          return _0x4f9887.compareOp(_0x3f88d6, _0x195108, _0x4523c6, _0x3716ac, _0x417b97);
        } else if (_0xd7ad3.concatOp.includes(_0x195108)) {
          return _0x4f9887.concatOp(_0x3f88d6, _0x195108, _0x4523c6, _0x3716ac, _0x417b97);
        } else if (_0xd7ad3.mathOp.includes(_0x195108)) {
          return _0x4f9887.mathOp(_0x3f88d6, _0x195108, _0x4523c6, _0x3716ac, _0x417b97);
        } else {
          throw new Error("Unrecognized infix: " + _0x195108);
        }
      }
      async applyInfixAsync(_0x519a22, _0x46bc27, _0x44b742) {
        const _0x29fd76 = this.extractRefValue(await _0x519a22);
        const _0x4459ba = this.extractRefValue(await _0x44b742);
        return this._applyInfix(_0x29fd76, _0x46bc27, _0x4459ba);
      }
      applyInfix(_0x439779, _0x504028, _0x56c538) {
        if (this.context.async) {
          return this.applyInfixAsync(_0x439779, _0x504028, _0x56c538);
        } else {
          const _0x4e9491 = this.extractRefValue(_0x439779);
          const _0x645c65 = this.extractRefValue(_0x56c538);
          return this._applyInfix(_0x4e9491, _0x504028, _0x645c65);
        }
      }
      applyIntersect(_0x3f3446) {
        if (this.isFormulaError(_0x3f3446[0])) {
          return _0x3f3446[0];
        }
        if (!_0x3f3446[0].ref) {
          throw Error("Expecting a reference, but got " + _0x3f3446[0] + ".");
        }
        let _0x34e9d3;
        let _0x58a144;
        let _0x5c31d4;
        let _0x286133;
        let _0x22e6f2;
        let _0x39531c;
        const _0x3b714a = _0x3f3446.shift().ref;
        _0x22e6f2 = _0x3b714a.sheet;
        if (!_0x3b714a.from) {
          if (_0x3b714a.row === undefined || _0x3b714a.col === undefined) {
            throw Error("Cannot intersect the whole row or column.");
          }
          _0x34e9d3 = _0x5c31d4 = _0x3b714a.row;
          _0x58a144 = _0x286133 = _0x3b714a.col;
        } else {
          _0x34e9d3 = Math.max(_0x3b714a.from.row, _0x3b714a.to.row);
          _0x5c31d4 = Math.min(_0x3b714a.from.row, _0x3b714a.to.row);
          _0x58a144 = Math.max(_0x3b714a.from.col, _0x3b714a.to.col);
          _0x286133 = Math.min(_0x3b714a.from.col, _0x3b714a.to.col);
        }
        let _0x5b53d7;
        _0x3f3446.forEach(_0x5235cf => {
          if (this.isFormulaError(_0x5235cf)) {
            return _0x5235cf;
          }
          _0x5235cf = _0x5235cf.ref;
          if (!_0x5235cf) {
            throw Error("Expecting a reference, but got " + _0x5235cf + ".");
          }
          if (!_0x5235cf.from) {
            if (_0x5235cf.row === undefined || _0x5235cf.col === undefined) {
              throw Error("Cannot intersect the whole row or column.");
            }
            if (_0x5235cf.row > _0x34e9d3 || _0x5235cf.row < _0x5c31d4 || _0x5235cf.col > _0x58a144 || _0x5235cf.col < _0x286133 || _0x22e6f2 !== _0x5235cf.sheet) {
              _0x5b53d7 = _0x410173.NULL;
            }
            _0x34e9d3 = _0x5c31d4 = _0x5235cf.row;
            _0x58a144 = _0x286133 = _0x5235cf.col;
          } else {
            const _0x241b84 = Math.max(_0x5235cf.from.row, _0x5235cf.to.row);
            const _0x26e6b7 = Math.min(_0x5235cf.from.row, _0x5235cf.to.row);
            const _0x235288 = Math.max(_0x5235cf.from.col, _0x5235cf.to.col);
            const _0x4215e0 = Math.min(_0x5235cf.from.col, _0x5235cf.to.col);
            if (_0x26e6b7 > _0x34e9d3 || _0x241b84 < _0x5c31d4 || _0x4215e0 > _0x58a144 || _0x235288 < _0x286133 || _0x22e6f2 !== _0x5235cf.sheet) {
              _0x5b53d7 = _0x410173.NULL;
            }
            _0x34e9d3 = Math.min(_0x34e9d3, _0x241b84);
            _0x5c31d4 = Math.max(_0x5c31d4, _0x26e6b7);
            _0x58a144 = Math.min(_0x58a144, _0x235288);
            _0x286133 = Math.max(_0x286133, _0x4215e0);
          }
        });
        if (_0x5b53d7) {
          return _0x5b53d7;
        }
        if (_0x34e9d3 === _0x5c31d4 && _0x58a144 === _0x286133) {
          var _0x5e9690 = {
            sheet: _0x22e6f2,
            row: _0x34e9d3,
            col: _0x58a144
          };
          var _0x10dae6 = {
            ref: _0x5e9690
          };
          _0x39531c = _0x10dae6;
        } else {
          var _0x3d4ee4 = {
            row: _0x5c31d4,
            col: _0x286133
          };
          var _0x5af875 = {
            row: _0x34e9d3,
            col: _0x58a144
          };
          var _0x206f17 = {
            sheet: _0x22e6f2,
            from: _0x3d4ee4,
            to: _0x5af875
          };
          var _0x4f2b43 = {
            ref: _0x206f17
          };
          _0x39531c = _0x4f2b43;
        }
        if (!_0x39531c.ref.sheet) {
          delete _0x39531c.ref.sheet;
        }
        return _0x39531c;
      }
      applyUnion(_0x1114d3) {
        const _0x4bde7d = new _0x8440c9();
        for (let _0xd048f0 = 0; _0xd048f0 < _0x1114d3.length; _0xd048f0++) {
          if (this.isFormulaError(_0x1114d3[_0xd048f0])) {
            return _0x1114d3[_0xd048f0];
          }
          _0x4bde7d.add(this.extractRefValue(_0x1114d3[_0xd048f0]).val, _0x1114d3[_0xd048f0]);
        }
        return _0x4bde7d;
      }
      applyRange(_0x34b992) {
        let _0x4de7a6;
        let _0x4826f3 = -1;
        let _0x17ed03 = -1;
        let _0x5c37f2 = _0x305ff9 + 1;
        let _0x53c00f = _0x463129 + 1;
        _0x34b992.forEach(_0x577169 => {
          if (this.isFormulaError(_0x577169)) {
            return _0x577169;
          }
          if (typeof _0x577169 === "number") {
            _0x577169 = this.parseRow(_0x577169);
          }
          _0x577169 = _0x577169.ref;
          if (_0x577169.row === undefined) {
            _0x5c37f2 = 1;
            _0x4826f3 = _0x305ff9;
          }
          if (_0x577169.col === undefined) {
            _0x53c00f = 1;
            _0x17ed03 = _0x463129;
          }
          if (_0x577169.row > _0x4826f3) {
            _0x4826f3 = _0x577169.row;
          }
          if (_0x577169.row < _0x5c37f2) {
            _0x5c37f2 = _0x577169.row;
          }
          if (_0x577169.col > _0x17ed03) {
            _0x17ed03 = _0x577169.col;
          }
          if (_0x577169.col < _0x53c00f) {
            _0x53c00f = _0x577169.col;
          }
        });
        if (_0x4826f3 === _0x5c37f2 && _0x17ed03 === _0x53c00f) {
          var _0x5d25a3 = {
            row: _0x4826f3,
            col: _0x17ed03
          };
          var _0x436f62 = {
            ref: _0x5d25a3
          };
          _0x4de7a6 = _0x436f62;
        } else {
          var _0x186599 = {
            row: _0x5c37f2,
            col: _0x53c00f
          };
          var _0x28caac = {
            row: _0x4826f3,
            col: _0x17ed03
          };
          var _0x287624 = {
            from: _0x186599,
            to: _0x28caac
          };
          var _0x47b193 = {
            ref: _0x287624
          };
          _0x4de7a6 = _0x47b193;
        }
        return _0x4de7a6;
      }
      extractRefValue(_0x29fba0) {
        let _0x403b8d = _0x29fba0;
        let _0x2b358f = false;
        if (Array.isArray(_0x403b8d)) {
          _0x2b358f = true;
        }
        if (_0x29fba0.ref) {
          return {
            val: this.context.retrieveRef(_0x29fba0),
            isArray: _0x2b358f
          };
        }
        var _0x577ddf = {
          val: _0x403b8d,
          isArray: _0x2b358f
        };
        return _0x577ddf;
      }
      toArray(_0x61f0fe) {
        return _0x61f0fe;
      }
      toNumber(_0x2222bc) {
        return Number(_0x2222bc);
      }
      toString(_0x391c06) {
        return _0x391c06.substring(1, _0x391c06.length - 1).replace(/""/g, "\"");
      }
      toBoolean(_0x200ea2) {
        return _0x200ea2 === "TRUE";
      }
      toError(_0x58db6) {
        return new _0x410173(_0x58db6.toUpperCase());
      }
      isFormulaError(_0x14d845) {
        return _0x14d845 instanceof _0x410173;
      }
      static formatChevrotainError(_0x207850, _0x386f7f) {
        let _0x4e7117;
        let _0x155de3;
        let _0x50dfe5 = "";
        if (_0x207850 instanceof _0x884fb8) {
          _0x4e7117 = _0x207850.token.startLine;
          _0x155de3 = _0x207850.token.startColumn;
        } else {
          _0x4e7117 = _0x207850.previousToken.startLine;
          _0x155de3 = _0x207850.previousToken.startColumn + 1;
        }
        _0x50dfe5 += "\n" + _0x386f7f.split("\n")[_0x4e7117 - 1] + "\n";
        _0x50dfe5 += Array(_0x155de3 - 1).fill(" ").join("") + "^\n";
        _0x50dfe5 += "Error at position " + _0x4e7117 + ":" + _0x155de3 + "\n" + _0x207850.message;
        var _0x6ed62 = {
          line: _0x4e7117,
          column: _0x155de3
        };
        _0x207850.errorLocation = _0x6ed62;
        return _0x410173.ERROR(_0x50dfe5, _0x207850);
      }
    };
    _0x18d0c7.exports = _0x29b713;
  }
});
var FormulaError = require_error();
var {
  FormulaHelpers
} = require_helpers();
var {
  Parser
} = require_parsing();
var lexer = require_lexing();
var Utils = require_utils();
var {
  formatChevrotainError
} = require_utils2();
var DepParser = class {
  constructor(_0x11ac03) {
    this.data = [];
    this.utils = new Utils(this);
    var _0x16dc8b = {
      onVariable: () => null
    };
    _0x11ac03 = Object.assign(_0x16dc8b, _0x11ac03);
    this.utils = new Utils(this);
    this.onVariable = _0x11ac03.onVariable;
    this.functions = {};
    this.parser = new Parser(this, this.utils);
  }
  getCell(_0x10b164) {
    if (_0x10b164.row != null) {
      if (_0x10b164.sheet == null) {
        _0x10b164.sheet = this.position ? this.position.sheet : undefined;
      }
      const _0x37f2d4 = this.data.findIndex(_0x43ca95 => {
        return _0x43ca95.from && _0x43ca95.from.row <= _0x10b164.row && _0x43ca95.to.row >= _0x10b164.row && _0x43ca95.from.col <= _0x10b164.col && _0x43ca95.to.col >= _0x10b164.col || _0x43ca95.row === _0x10b164.row && _0x43ca95.col === _0x10b164.col && _0x43ca95.sheet === _0x10b164.sheet;
      });
      if (_0x37f2d4 === -1) {
        this.data.push(_0x10b164);
      }
    }
    return 0;
  }
  getRange(_0x37a841) {
    if (_0x37a841.from.row != null) {
      if (_0x37a841.sheet == null) {
        _0x37a841.sheet = this.position ? this.position.sheet : undefined;
      }
      const _0x842c6a = this.data.findIndex(_0x32a909 => {
        return _0x32a909.from && _0x32a909.from.row === _0x37a841.from.row && _0x32a909.from.col === _0x37a841.from.col && _0x32a909.to.row === _0x37a841.to.row && _0x32a909.to.col === _0x37a841.to.col;
      });
      if (_0x842c6a === -1) {
        this.data.push(_0x37a841);
      }
    }
    return [[0]];
  }
  getVariable(_0x206ef4) {
    const _0x9ab4f7 = {
      ref: this.onVariable(_0x206ef4, this.position.sheet)
    };
    if (_0x9ab4f7.ref == null) {
      return FormulaError.NAME;
    }
    if (FormulaHelpers.isCellRef(_0x9ab4f7)) {
      this.getCell(_0x9ab4f7.ref);
    } else {
      this.getRange(_0x9ab4f7.ref);
    }
    return 0;
  }
  retrieveRef(_0x599a15) {
    if (FormulaHelpers.isRangeRef(_0x599a15)) {
      return this.getRange(_0x599a15.ref);
    }
    if (FormulaHelpers.isCellRef(_0x599a15)) {
      return this.getCell(_0x599a15.ref);
    }
    return _0x599a15;
  }
  callFunction(_0x53d485, _0xf04e6b) {
    _0xf04e6b.forEach(_0x5bbbd9 => {
      if (_0x5bbbd9 == null) {
        return;
      }
      this.retrieveRef(_0x5bbbd9);
    });
    return {
      value: 0,
      ref: {}
    };
  }
  checkFormulaResult(_0x3ddb3f) {
    this.retrieveRef(_0x3ddb3f);
  }
  parse(_0x490093, _0x32c6be, _0x61349b = false) {
    if (_0x490093.length === 0) {
      throw Error("Input must not be empty.");
    }
    this.data = [];
    this.position = _0x32c6be;
    const _0x357bc0 = lexer.lex(_0x490093);
    this.parser.input = _0x357bc0.tokens;
    try {
      const _0x4e9d9a = this.parser.formulaWithBinaryOp();
      this.checkFormulaResult(_0x4e9d9a);
    } catch (_0x29b184) {
      if (!_0x61349b) {
        throw FormulaError.ERROR(_0x29b184.message, _0x29b184);
      }
    }
    if (this.parser.errors.length > 0 && !_0x61349b) {
      const _0x78de9f = this.parser.errors[0];
      throw formatChevrotainError(_0x78de9f, _0x490093);
    }
    return this.data;
  }
};
var _0x3ba271 = {
  DepParser: DepParser
};
module.exports = _0x3ba271;