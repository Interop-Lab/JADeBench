var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0xf0d1a4, _0x4df356) => function _0x22d33d() {
  if (!_0x4df356) {
    (0, _0xf0d1a4[__getOwnPropNames(_0xf0d1a4)[0]])((_0x4df356 = {
      exports: {}
    }).exports, _0x4df356);
  }
  return _0x4df356.exports;
};
var require_debug = __commonJS({
  "../work/cli-table__cli-table3/src/debug.js"(_0x4e8053, _0x58bb1e) {
    var _0x10b81c = [];
    var _0x3574e8 = 0;
    var _0x1a867c = (_0x45ab3c, _0x4b33f0) => {
      if (_0x3574e8 >= _0x4b33f0) {
        _0x10b81c.push(_0x45ab3c);
      }
    };
    _0x1a867c.WARN = 1;
    _0x1a867c.INFO = 2;
    _0x1a867c.DEBUG = 3;
    _0x1a867c.reset = () => {
      _0x10b81c = [];
    };
    _0x1a867c.setDebugLevel = _0x28c0a4 => {
      _0x3574e8 = _0x28c0a4;
    };
    _0x1a867c.warn = _0x1d3e22 => _0x1a867c(_0x1d3e22, _0x1a867c.WARN);
    _0x1a867c.info = _0xa7d40 => _0x1a867c(_0xa7d40, _0x1a867c.INFO);
    _0x1a867c.debug = _0xa73ad7 => _0x1a867c(_0xa73ad7, _0x1a867c.DEBUG);
    _0x1a867c.debugMessages = () => _0x10b81c;
    _0x58bb1e.exports = _0x1a867c;
  }
});
var require_utils = __commonJS({
  "../work/cli-table__cli-table3/src/utils.js"(_0x7e0020, _0x5a0543) {
    var _0x4c7da8 = require("string-width");
    function _0x4747ca(_0x446a72) {
      if (_0x446a72) {
        return /\u001b\[((?:\d*;){0,5}\d*)m/g;
      } else {
        return /\u001b\[(?:\d*;){0,5}\d*m/g;
      }
    }
    function _0x29b971(_0x4459a5) {
      let _0x26d42f = _0x4747ca();
      let _0x2119b8 = ("" + _0x4459a5).replace(_0x26d42f, "");
      let _0x44e15a = _0x2119b8.split("\n");
      return _0x44e15a.reduce(function (_0x47c952, _0x573da5) {
        if (_0x4c7da8(_0x573da5) > _0x47c952) {
          return _0x4c7da8(_0x573da5);
        } else {
          return _0x47c952;
        }
      }, 0);
    }
    function _0x593196(_0x2da0c9, _0x44e602) {
      return Array(_0x44e602 + 1).join(_0x2da0c9);
    }
    function _0x2d1d5d(_0x10fd03, _0x3bd3b8, _0x501b97, _0x1259e0) {
      let _0x460391 = _0x29b971(_0x10fd03);
      if (_0x3bd3b8 + 1 >= _0x460391) {
        let _0x5e3af7 = _0x3bd3b8 - _0x460391;
        switch (_0x1259e0) {
          case "right":
            {
              _0x10fd03 = _0x593196(_0x501b97, _0x5e3af7) + _0x10fd03;
              break;
            }
          case "center":
            {
              let _0x4f64a3 = Math.ceil(_0x5e3af7 / 2);
              let _0x45e5d2 = _0x5e3af7 - _0x4f64a3;
              _0x10fd03 = _0x593196(_0x501b97, _0x45e5d2) + _0x10fd03 + _0x593196(_0x501b97, _0x4f64a3);
              break;
            }
          default:
            {
              _0x10fd03 = _0x10fd03 + _0x593196(_0x501b97, _0x5e3af7);
              break;
            }
        }
      }
      return _0x10fd03;
    }
    var _0x529d12 = {};
    function _0x559004(_0x16115e, _0x5c1a86, _0x2b3509) {
      _0x5c1a86 = "[" + _0x5c1a86 + "m";
      _0x2b3509 = "[" + _0x2b3509 + "m";
      const _0xa46652 = {
        set: _0x16115e,
        to: true
      };
      _0x529d12[_0x5c1a86] = _0xa46652;
      const _0x14ce9b = {
        set: _0x16115e,
        to: false
      };
      _0x529d12[_0x2b3509] = _0x14ce9b;
      const _0x430af9 = {
        on: _0x5c1a86,
        off: _0x2b3509
      };
      _0x529d12[_0x16115e] = _0x430af9;
    }
    _0x559004("bold", 1, 22);
    _0x559004("italics", 3, 23);
    _0x559004("underline", 4, 24);
    _0x559004("inverse", 7, 27);
    _0x559004("strikethrough", 9, 29);
    function _0x515784(_0x4b9350, _0x4c27ca) {
      let _0xe2bfe2 = _0x4c27ca[1] ? parseInt(_0x4c27ca[1].split(";")[0]) : 0;
      if (_0xe2bfe2 >= 30 && _0xe2bfe2 <= 39 || _0xe2bfe2 >= 90 && _0xe2bfe2 <= 97) {
        _0x4b9350.lastForegroundAdded = _0x4c27ca[0];
        return;
      }
      if (_0xe2bfe2 >= 40 && _0xe2bfe2 <= 49 || _0xe2bfe2 >= 100 && _0xe2bfe2 <= 107) {
        _0x4b9350.lastBackgroundAdded = _0x4c27ca[0];
        return;
      }
      if (_0xe2bfe2 === 0) {
        for (let _0x5a2bfd in _0x4b9350) {
          if (Object.prototype.hasOwnProperty.call(_0x4b9350, _0x5a2bfd)) {
            delete _0x4b9350[_0x5a2bfd];
          }
        }
        return;
      }
      let _0x1daec4 = _0x529d12[_0x4c27ca[0]];
      if (_0x1daec4) {
        _0x4b9350[_0x1daec4.set] = _0x1daec4.to;
      }
    }
    function _0x32c3d6(_0x2687c8) {
      let _0x15d8b5 = _0x4747ca(true);
      let _0x338fc8 = _0x15d8b5.exec(_0x2687c8);
      let _0xf2357e = {};
      while (_0x338fc8 !== null) {
        _0x515784(_0xf2357e, _0x338fc8);
        _0x338fc8 = _0x15d8b5.exec(_0x2687c8);
      }
      return _0xf2357e;
    }
    function _0x4755e8(_0x397737, _0x337507) {
      let _0x1cb615 = _0x397737.lastBackgroundAdded;
      let _0x4b88e9 = _0x397737.lastForegroundAdded;
      delete _0x397737.lastBackgroundAdded;
      delete _0x397737.lastForegroundAdded;
      Object.keys(_0x397737).forEach(function (_0x32e009) {
        if (_0x397737[_0x32e009]) {
          _0x337507 += _0x529d12[_0x32e009].off;
        }
      });
      if (_0x1cb615 && _0x1cb615 != "[49m") {
        _0x337507 += "[49m";
      }
      if (_0x4b88e9 && _0x4b88e9 != "[39m") {
        _0x337507 += "[39m";
      }
      return _0x337507;
    }
    function _0x1d1090(_0x106c3d, _0x42f135) {
      let _0x18f7f2 = _0x106c3d.lastBackgroundAdded;
      let _0x5463c6 = _0x106c3d.lastForegroundAdded;
      delete _0x106c3d.lastBackgroundAdded;
      delete _0x106c3d.lastForegroundAdded;
      Object.keys(_0x106c3d).forEach(function (_0x2aa4e4) {
        if (_0x106c3d[_0x2aa4e4]) {
          _0x42f135 = _0x529d12[_0x2aa4e4].on + _0x42f135;
        }
      });
      if (_0x18f7f2 && _0x18f7f2 != "[49m") {
        _0x42f135 = _0x18f7f2 + _0x42f135;
      }
      if (_0x5463c6 && _0x5463c6 != "[39m") {
        _0x42f135 = _0x5463c6 + _0x42f135;
      }
      return _0x42f135;
    }
    function _0x250b07(_0x238f86, _0x4f9a0f) {
      if (_0x238f86.length === _0x29b971(_0x238f86)) {
        return _0x238f86.substr(0, _0x4f9a0f);
      }
      while (_0x29b971(_0x238f86) > _0x4f9a0f) {
        _0x238f86 = _0x238f86.slice(0, -1);
      }
      return _0x238f86;
    }
    function _0x41bb94(_0x32d805, _0x22deb0) {
      let _0xcbc2ee = _0x4747ca(true);
      let _0x3dee65 = _0x32d805.split(_0x4747ca());
      let _0x2b4bcd = 0;
      let _0x1dc15f = 0;
      let _0x43c060 = "";
      let _0x40bd40;
      let _0x1fb1c0 = {};
      while (_0x1dc15f < _0x22deb0) {
        _0x40bd40 = _0xcbc2ee.exec(_0x32d805);
        let _0x124047 = _0x3dee65[_0x2b4bcd];
        _0x2b4bcd++;
        if (_0x1dc15f + _0x29b971(_0x124047) > _0x22deb0) {
          _0x124047 = _0x250b07(_0x124047, _0x22deb0 - _0x1dc15f);
        }
        _0x43c060 += _0x124047;
        _0x1dc15f += _0x29b971(_0x124047);
        if (_0x1dc15f < _0x22deb0) {
          if (!_0x40bd40) {
            break;
          }
          _0x43c060 += _0x40bd40[0];
          _0x515784(_0x1fb1c0, _0x40bd40);
        }
      }
      return _0x4755e8(_0x1fb1c0, _0x43c060);
    }
    function _0x1b44a0(_0x124e8a, _0x44de11, _0xad91e5) {
      _0xad91e5 = _0xad91e5 || "…";
      let _0xa2255a = _0x29b971(_0x124e8a);
      if (_0xa2255a <= _0x44de11) {
        return _0x124e8a;
      }
      _0x44de11 -= _0x29b971(_0xad91e5);
      let _0x4a698b = _0x41bb94(_0x124e8a, _0x44de11);
      _0x4a698b += _0xad91e5;
      const _0xbf522a = "]8;;";
      if (_0x124e8a.includes(_0xbf522a) && !_0x4a698b.includes(_0xbf522a)) {
        _0x4a698b += _0xbf522a;
      }
      return _0x4a698b;
    }
    function _0x18edad() {
      return {
        chars: {
          top: "─",
          "top-mid": "┬",
          "top-left": "┌",
          "top-right": "┐",
          bottom: "─",
          "bottom-mid": "┴",
          "bottom-left": "└",
          "bottom-right": "┘",
          left: "│",
          "left-mid": "├",
          mid: "─",
          "mid-mid": "┼",
          right: "│",
          "right-mid": "┤",
          middle: "│"
        },
        truncate: "…",
        colWidths: [],
        rowHeights: [],
        colAligns: [],
        rowAligns: [],
        style: {
          "padding-left": 1,
          "padding-right": 1,
          head: ["red"],
          border: ["grey"],
          compact: false
        },
        head: []
      };
    }
    function _0x5091c5(_0x1596dc, _0x397306) {
      _0x1596dc = _0x1596dc || {};
      _0x397306 = _0x397306 || _0x18edad();
      let _0x5ddf06 = Object.assign({}, _0x397306, _0x1596dc);
      _0x5ddf06.chars = Object.assign({}, _0x397306.chars, _0x1596dc.chars);
      _0x5ddf06.style = Object.assign({}, _0x397306.style, _0x1596dc.style);
      return _0x5ddf06;
    }
    function _0x4270e1(_0x4bd5cb, _0x23d870) {
      let _0x1600aa = [];
      let _0x2b2f33 = _0x23d870.split(/(\s+)/g);
      let _0x28ed2d = [];
      let _0x1e31f7 = 0;
      let _0x474e43;
      for (let _0x5b4771 = 0; _0x5b4771 < _0x2b2f33.length; _0x5b4771 += 2) {
        let _0x3ba915 = _0x2b2f33[_0x5b4771];
        let _0x4c0d44 = _0x1e31f7 + _0x29b971(_0x3ba915);
        if (_0x1e31f7 > 0 && _0x474e43) {
          _0x4c0d44 += _0x474e43.length;
        }
        if (_0x4c0d44 > _0x4bd5cb) {
          if (_0x1e31f7 !== 0) {
            _0x1600aa.push(_0x28ed2d.join(""));
          }
          _0x28ed2d = [_0x3ba915];
          _0x1e31f7 = _0x29b971(_0x3ba915);
        } else {
          _0x28ed2d.push(_0x474e43 || "", _0x3ba915);
          _0x1e31f7 = _0x4c0d44;
        }
        _0x474e43 = _0x2b2f33[_0x5b4771 + 1];
      }
      if (_0x1e31f7) {
        _0x1600aa.push(_0x28ed2d.join(""));
      }
      return _0x1600aa;
    }
    function _0x60113f(_0x43c498, _0xc9992a) {
      let _0x5d222d = [];
      let _0x39a86f = "";
      function _0x28fff5(_0x4bced6, _0x337b03) {
        if (_0x39a86f.length && _0x337b03) {
          _0x39a86f += _0x337b03;
        }
        _0x39a86f += _0x4bced6;
        while (_0x39a86f.length > _0x43c498) {
          _0x5d222d.push(_0x39a86f.slice(0, _0x43c498));
          _0x39a86f = _0x39a86f.slice(_0x43c498);
        }
      }
      let _0x53d274 = _0xc9992a.split(/(\s+)/g);
      for (let _0x4c384d = 0; _0x4c384d < _0x53d274.length; _0x4c384d += 2) {
        _0x28fff5(_0x53d274[_0x4c384d], _0x4c384d && _0x53d274[_0x4c384d - 1]);
      }
      if (_0x39a86f.length) {
        _0x5d222d.push(_0x39a86f);
      }
      return _0x5d222d;
    }
    function _0x398e6b(_0x5c298f, _0x15a658, _0x348bea = true) {
      let _0x3a70cf = [];
      _0x15a658 = _0x15a658.split("\n");
      const _0x49f2da = _0x348bea ? _0x4270e1 : _0x60113f;
      for (let _0x1a7605 = 0; _0x1a7605 < _0x15a658.length; _0x1a7605++) {
        _0x3a70cf.push.apply(_0x3a70cf, _0x49f2da(_0x5c298f, _0x15a658[_0x1a7605]));
      }
      return _0x3a70cf;
    }
    function _0x10fec0(_0x2720e6) {
      let _0x1336d3 = {};
      let _0x1dabc3 = [];
      for (let _0x4dc9de = 0; _0x4dc9de < _0x2720e6.length; _0x4dc9de++) {
        let _0x44e4d2 = _0x1d1090(_0x1336d3, _0x2720e6[_0x4dc9de]);
        _0x1336d3 = _0x32c3d6(_0x44e4d2);
        let _0x27fa64 = Object.assign({}, _0x1336d3);
        _0x1dabc3.push(_0x4755e8(_0x27fa64, _0x44e4d2));
      }
      return _0x1dabc3;
    }
    function _0x13aa8a(_0x4add54, _0x3430f2) {
      const _0x119ad7 = "]";
      const _0x116673 = "";
      const _0x7354ab = ";";
      return [_0x119ad7, "8", _0x7354ab, _0x7354ab, _0x4add54 || _0x3430f2, _0x116673, _0x3430f2, _0x119ad7, "8", _0x7354ab, _0x7354ab, _0x116673].join("");
    }
    function _0x653a92(_0x2d2da8) {
      const _0x2226c9 = /#[0-9a-fA-F]{3,6}/;
      const [_0x568b27] = _0x2d2da8.match(_0x2226c9) || ["#000"];
      return _0x568b27;
    }
    const _0x4fa614 = {
      strlen: _0x29b971,
      repeat: _0x593196,
      pad: _0x2d1d5d,
      truncate: _0x1b44a0,
      mergeOptions: _0x5091c5,
      wordWrap: _0x398e6b,
      colorizeLines: _0x10fec0,
      hyperlink: _0x13aa8a,
      parseHexValue: _0x653a92
    };
    _0x5a0543.exports = _0x4fa614;
  }
});
var require_cell = __commonJS({
  "../work/cli-table__cli-table3/src/cell.js"(_0x1df453, _0x3d65cd) {
    var {
      info: _0x5d6f4d,
      debug: _0x1da569
    } = require_debug();
    var _0x61c1c3 = require_utils();
    var _0x44bae6 = class _0x16878c {
      constructor(_0x13e6b6) {
        this.setOptions(_0x13e6b6);
        this.x = null;
        this.y = null;
      }
      setOptions(_0xa69aab) {
        if (["boolean", "number", "bigint", "string"].indexOf(typeof _0xa69aab) !== -1) {
          _0xa69aab = {
            content: "" + _0xa69aab
          };
        }
        _0xa69aab = _0xa69aab || {};
        this.options = _0xa69aab;
        let _0x3cc316 = _0xa69aab.content;
        if (["boolean", "number", "bigint", "string"].indexOf(typeof _0x3cc316) !== -1) {
          this.content = String(_0x3cc316);
        } else if (!_0x3cc316) {
          this.content = this.options.href || "";
        } else {
          throw new Error("Content needs to be a primitive, got: " + typeof _0x3cc316);
        }
        this.colSpan = _0xa69aab.colSpan || 1;
        this.rowSpan = _0xa69aab.rowSpan || 1;
        if (this.options.href) {
          Object.defineProperty(this, "href", {
            get() {
              return this.options.href;
            }
          });
        }
      }
      mergeTableOptions(_0x502f04, _0x249f14) {
        this.cells = _0x249f14;
        let _0x222f22 = this.options.chars || {};
        let _0x548484 = _0x502f04.chars;
        let _0x39894c = this.chars = {};
        _0x217c4c.forEach(function (_0x3d8f9c) {
          _0x21dbf6(_0x222f22, _0x548484, _0x3d8f9c, _0x39894c);
        });
        this.truncate = this.options.truncate || _0x502f04.truncate;
        let _0x3cfa20 = this.options.style = this.options.style || {};
        let _0x448d07 = _0x502f04.style;
        _0x21dbf6(_0x3cfa20, _0x448d07, "padding-left", this);
        _0x21dbf6(_0x3cfa20, _0x448d07, "padding-right", this);
        this.head = _0x3cfa20.head || _0x448d07.head;
        this.border = _0x3cfa20.border || _0x448d07.border;
        this.fixedWidth = _0x502f04.colWidths[this.x];
        this.lines = this.computeLines(_0x502f04);
        this.desiredWidth = _0x61c1c3.strlen(this.content) + this.paddingLeft + this.paddingRight;
        this.desiredHeight = this.lines.length;
      }
      computeLines(_0x25596c) {
        const _0x14ea3b = _0x25596c.wordWrap || _0x25596c.textWrap;
        const {
          wordWrap = _0x14ea3b
        } = this.options;
        if (this.fixedWidth && wordWrap) {
          this.fixedWidth -= this.paddingLeft + this.paddingRight;
          if (this.colSpan) {
            let _0x174ef9 = 1;
            while (_0x174ef9 < this.colSpan) {
              this.fixedWidth += _0x25596c.colWidths[this.x + _0x174ef9];
              _0x174ef9++;
            }
          }
          const {
            wrapOnWordBoundary: _0x1b7fce = true
          } = _0x25596c;
          const {
            wrapOnWordBoundary = _0x1b7fce
          } = this.options;
          return this.wrapLines(_0x61c1c3.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
        }
        return this.wrapLines(this.content.split("\n"));
      }
      wrapLines(_0x1b3f3c) {
        const _0x36e00e = _0x61c1c3.colorizeLines(_0x1b3f3c);
        if (this.href) {
          return _0x36e00e.map(_0x304d43 => _0x61c1c3.hyperlink(this.href, _0x304d43));
        }
        return _0x36e00e;
      }
      init(_0x153f2a) {
        let _0xd01dc3 = this.x;
        let _0x44b00f = this.y;
        this.widths = _0x153f2a.colWidths.slice(_0xd01dc3, _0xd01dc3 + this.colSpan);
        this.heights = _0x153f2a.rowHeights.slice(_0x44b00f, _0x44b00f + this.rowSpan);
        this.width = this.widths.reduce(_0x4f3dee, -1);
        this.height = this.heights.reduce(_0x4f3dee, -1);
        this.hAlign = this.options.hAlign || _0x153f2a.colAligns[_0xd01dc3];
        this.vAlign = this.options.vAlign || _0x153f2a.rowAligns[_0x44b00f];
        this.drawRight = _0xd01dc3 + this.colSpan == _0x153f2a.colWidths.length;
      }
      draw(_0x9613f, _0x258e5c) {
        if (_0x9613f == "top") {
          return this.drawTop(this.drawRight);
        }
        if (_0x9613f == "bottom") {
          return this.drawBottom(this.drawRight);
        }
        let _0x56a66f = _0x61c1c3.truncate(this.content, 10, this.truncate);
        if (!_0x9613f) {
          _0x5d6f4d(this.y + "-" + this.x + ": " + (this.rowSpan - _0x9613f) + "x" + this.colSpan + " Cell " + _0x56a66f);
        } else {}
        let _0x3ae3d6 = Math.max(this.height - this.lines.length, 0);
        let _0x4119c5;
        switch (this.vAlign) {
          case "center":
            _0x4119c5 = Math.ceil(_0x3ae3d6 / 2);
            break;
          case "bottom":
            _0x4119c5 = _0x3ae3d6;
            break;
          default:
            _0x4119c5 = 0;
        }
        if (_0x9613f < _0x4119c5 || _0x9613f >= _0x4119c5 + this.lines.length) {
          return this.drawEmpty(this.drawRight, _0x258e5c);
        }
        let _0x519858 = this.lines.length > this.height && _0x9613f + 1 >= this.height;
        return this.drawLine(_0x9613f - _0x4119c5, this.drawRight, _0x519858, _0x258e5c);
      }
      drawTop(_0x139abf) {
        let _0xef7b1a = [];
        if (this.cells) {
          this.widths.forEach(function (_0x287354, _0x400d5b) {
            _0xef7b1a.push(this._topLeftChar(_0x400d5b));
            _0xef7b1a.push(_0x61c1c3.repeat(this.chars[this.y == 0 ? "top" : "mid"], _0x287354));
          }, this);
        } else {
          _0xef7b1a.push(this._topLeftChar(0));
          _0xef7b1a.push(_0x61c1c3.repeat(this.chars[this.y == 0 ? "top" : "mid"], this.width));
        }
        if (_0x139abf) {
          _0xef7b1a.push(this.chars[this.y == 0 ? "topRight" : "rightMid"]);
        }
        return this.wrapWithStyleColors("border", _0xef7b1a.join(""));
      }
      _topLeftChar(_0x196c79) {
        let _0x285e83 = this.x + _0x196c79;
        let _0x2c4c73;
        if (this.y == 0) {
          _0x2c4c73 = _0x285e83 == 0 ? "topLeft" : _0x196c79 == 0 ? "topMid" : "top";
        } else if (_0x285e83 == 0) {
          _0x2c4c73 = "leftMid";
        } else {
          _0x2c4c73 = _0x196c79 == 0 ? "midMid" : "bottomMid";
          if (this.cells) {
            let _0x197f3e = this.cells[this.y - 1][_0x285e83] instanceof _0x16878c.ColSpanCell;
            if (_0x197f3e) {
              _0x2c4c73 = _0x196c79 == 0 ? "topMid" : "mid";
            }
            if (_0x196c79 == 0) {
              let _0x79e010 = 1;
              while (this.cells[this.y][_0x285e83 - _0x79e010] instanceof _0x16878c.ColSpanCell) {
                _0x79e010++;
              }
              if (this.cells[this.y][_0x285e83 - _0x79e010] instanceof _0x16878c.RowSpanCell) {
                _0x2c4c73 = "leftMid";
              }
            }
          }
        }
        return this.chars[_0x2c4c73];
      }
      wrapWithStyleColors(_0x53aa21, _0x463866) {
        if (this[_0x53aa21] && this[_0x53aa21].length) {
          try {
            let _0xa68ce0 = require("ansis");
            for (let _0x37e215 = this[_0x53aa21].length - 1; _0x37e215 >= 0; _0x37e215--) {
              let _0x5bbcab = this[_0x53aa21][_0x37e215];
              let _0x550faa = _0x5bbcab.startsWith("hex");
              let _0x1c1674 = _0x5bbcab.startsWith("bgHex");
              if (_0x550faa || _0x1c1674) {
                let _0x4eb909 = _0x61c1c3.parseHexValue(_0x5bbcab);
                _0xa68ce0 = _0x1c1674 ? _0xa68ce0.bgHex(_0x4eb909) : _0xa68ce0.hex(_0x4eb909);
              } else {
                _0xa68ce0 = _0xa68ce0[_0x5bbcab];
              }
            }
            return _0xa68ce0(_0x463866);
          } catch (_0x2e1dc9) {
            return _0x463866;
          }
        } else {
          return _0x463866;
        }
      }
      drawLine(_0x1fd857, _0x4e38da, _0x175c46, _0x82e085) {
        let _0x32bf6a = this.chars[this.x == 0 ? "left" : "middle"];
        if (this.x && _0x82e085 && this.cells) {
          let _0x1097a5 = this.cells[this.y + _0x82e085][this.x - 1];
          while (_0x1097a5 instanceof _0x29654f) {
            _0x1097a5 = this.cells[_0x1097a5.y][_0x1097a5.x - 1];
          }
          if (!(_0x1097a5 instanceof _0x501e8e)) {
            _0x32bf6a = this.chars.rightMid;
          }
        }
        let _0x33b3b2 = _0x61c1c3.repeat(" ", this.paddingLeft);
        let _0x2af40f = _0x4e38da ? this.chars.right : "";
        let _0x133fea = _0x61c1c3.repeat(" ", this.paddingRight);
        let _0x29a53a = this.lines[_0x1fd857];
        let _0x1936d6 = this.width - (this.paddingLeft + this.paddingRight);
        if (_0x175c46) {
          _0x29a53a += this.truncate || "…";
        }
        let _0x113130 = _0x61c1c3.truncate(_0x29a53a, _0x1936d6, this.truncate);
        _0x113130 = _0x61c1c3.pad(_0x113130, _0x1936d6, " ", this.hAlign);
        _0x113130 = _0x33b3b2 + _0x113130 + _0x133fea;
        return this.stylizeLine(_0x32bf6a, _0x113130, _0x2af40f);
      }
      stylizeLine(_0x409c1b, _0x3a241e, _0x32cc4a) {
        _0x409c1b = this.wrapWithStyleColors("border", _0x409c1b);
        _0x32cc4a = this.wrapWithStyleColors("border", _0x32cc4a);
        if (this.y === 0) {
          _0x3a241e = this.wrapWithStyleColors("head", _0x3a241e);
        }
        return _0x409c1b + _0x3a241e + _0x32cc4a;
      }
      drawBottom(_0x37f405) {
        let _0x52f3dd = this.chars[this.x == 0 ? "bottomLeft" : "bottomMid"];
        let _0x403e86 = _0x61c1c3.repeat(this.chars.bottom, this.width);
        let _0xd65451 = _0x37f405 ? this.chars.bottomRight : "";
        return this.wrapWithStyleColors("border", _0x52f3dd + _0x403e86 + _0xd65451);
      }
      drawEmpty(_0x2d6628, _0x54b3b9) {
        let _0x1c4bbb = this.chars[this.x == 0 ? "left" : "middle"];
        if (this.x && _0x54b3b9 && this.cells) {
          let _0x29a4f2 = this.cells[this.y + _0x54b3b9][this.x - 1];
          while (_0x29a4f2 instanceof _0x29654f) {
            _0x29a4f2 = this.cells[_0x29a4f2.y][_0x29a4f2.x - 1];
          }
          if (!(_0x29a4f2 instanceof _0x501e8e)) {
            _0x1c4bbb = this.chars.rightMid;
          }
        }
        let _0x4f9c7e = _0x2d6628 ? this.chars.right : "";
        let _0x203ce7 = _0x61c1c3.repeat(" ", this.width);
        return this.stylizeLine(_0x1c4bbb, _0x203ce7, _0x4f9c7e);
      }
    };
    var _0x29654f = class {
      constructor() {}
      draw(_0x17dbf5) {
        if (typeof _0x17dbf5 === "number") {
          _0x1da569(this.y + "-" + this.x + ": 1x1 ColSpanCell");
        }
        return "";
      }
      init() {}
      mergeTableOptions() {}
    };
    var _0x501e8e = class {
      constructor(_0x2ece43) {
        this.originalCell = _0x2ece43;
      }
      init(_0x49f7f3) {
        let _0x5ccc5e = this.y;
        let _0x42d70f = this.originalCell.y;
        this.cellOffset = _0x5ccc5e - _0x42d70f;
        this.offset = _0x949d26(_0x49f7f3.rowHeights, _0x42d70f, this.cellOffset);
      }
      draw(_0x45cf6f) {
        if (_0x45cf6f == "top") {
          return this.originalCell.draw(this.offset, this.cellOffset);
        }
        if (_0x45cf6f == "bottom") {
          return this.originalCell.draw("bottom");
        }
        _0x1da569(this.y + "-" + this.x + ": 1x" + this.colSpan + " RowSpanCell for " + this.originalCell.content);
        return this.originalCell.draw(this.offset + 1 + _0x45cf6f);
      }
      mergeTableOptions() {}
    };
    function _0x456c34(..._0x16401a) {
      return _0x16401a.filter(_0x2f0e20 => _0x2f0e20 !== undefined && _0x2f0e20 !== null).shift();
    }
    function _0x21dbf6(_0xcc7e41, _0x400792, _0x687157, _0x5500b9) {
      let _0xb249f1 = _0x687157.split("-");
      if (_0xb249f1.length > 1) {
        _0xb249f1[1] = _0xb249f1[1].charAt(0).toUpperCase() + _0xb249f1[1].substr(1);
        _0xb249f1 = _0xb249f1.join("");
        _0x5500b9[_0xb249f1] = _0x456c34(_0xcc7e41[_0xb249f1], _0xcc7e41[_0x687157], _0x400792[_0xb249f1], _0x400792[_0x687157]);
      } else {
        _0x5500b9[_0x687157] = _0x456c34(_0xcc7e41[_0x687157], _0x400792[_0x687157]);
      }
    }
    function _0x949d26(_0x43bb40, _0x3bcad4, _0x3b3fba) {
      let _0x513d37 = _0x43bb40[_0x3bcad4];
      for (let _0x54b9d9 = 1; _0x54b9d9 < _0x3b3fba; _0x54b9d9++) {
        _0x513d37 += 1 + _0x43bb40[_0x3bcad4 + _0x54b9d9];
      }
      return _0x513d37;
    }
    function _0x4f3dee(_0x590699, _0x3e7465) {
      return _0x590699 + _0x3e7465 + 1;
    }
    var _0x217c4c = ["top", "top-mid", "top-left", "top-right", "bottom", "bottom-mid", "bottom-left", "bottom-right", "left", "left-mid", "mid", "mid-mid", "right", "right-mid", "middle"];
    _0x3d65cd.exports = _0x44bae6;
    _0x3d65cd.exports.ColSpanCell = _0x29654f;
    _0x3d65cd.exports.RowSpanCell = _0x501e8e;
  }
});
var require_layout_manager = __commonJS({
  "../work/cli-table__cli-table3/src/layout-manager.js"(_0x56bdf8, _0x3d64fc) {
    var {
      warn: _0x33a291,
      debug: _0x5c7c81
    } = require_debug();
    var _0x3e29f9 = require_cell();
    var {
      ColSpanCell: _0x2a4da8,
      RowSpanCell: _0x3aac30
    } = _0x3e29f9;
    (function () {
      function _0x25a683(_0x1ae945, _0x403a1e) {
        if (_0x1ae945[_0x403a1e] > 0) {
          return _0x25a683(_0x1ae945, _0x403a1e + 1);
        }
        return _0x403a1e;
      }
      function _0x2f03b1(_0x3567b0) {
        let _0x238bda = {};
        _0x3567b0.forEach(function (_0x1fb769, _0x22dc11) {
          let _0x1fbc6c = 0;
          _0x1fb769.forEach(function (_0x3f4f5e) {
            _0x3f4f5e.y = _0x22dc11;
            _0x3f4f5e.x = _0x22dc11 ? _0x25a683(_0x238bda, _0x1fbc6c) : _0x1fbc6c;
            const _0x2f064c = _0x3f4f5e.rowSpan || 1;
            const _0x377c2f = _0x3f4f5e.colSpan || 1;
            if (_0x2f064c > 1) {
              for (let _0x4e527a = 0; _0x4e527a < _0x377c2f; _0x4e527a++) {
                _0x238bda[_0x3f4f5e.x + _0x4e527a] = _0x2f064c;
              }
            }
            _0x1fbc6c = _0x3f4f5e.x + _0x377c2f;
          });
          Object.keys(_0x238bda).forEach(_0x52dc8a => {
            _0x238bda[_0x52dc8a]--;
            if (_0x238bda[_0x52dc8a] < 1) {
              delete _0x238bda[_0x52dc8a];
            }
          });
        });
      }
      function _0x2aa25e(_0x43086c) {
        let _0xb10036 = 0;
        _0x43086c.forEach(function (_0x430a36) {
          _0x430a36.forEach(function (_0x47a904) {
            _0xb10036 = Math.max(_0xb10036, _0x47a904.x + (_0x47a904.colSpan || 1));
          });
        });
        return _0xb10036;
      }
      function _0x2baccf(_0x2accb2) {
        return _0x2accb2.length;
      }
      function _0x5bf6d8(_0x3944fd, _0x365e9a) {
        let _0x2f09d7 = _0x3944fd.y;
        let _0x1b955a = _0x3944fd.y - 1 + (_0x3944fd.rowSpan || 1);
        let _0x363d4b = _0x365e9a.y;
        let _0x4a2145 = _0x365e9a.y - 1 + (_0x365e9a.rowSpan || 1);
        let _0x4710c0 = !(_0x2f09d7 > _0x4a2145) && !(_0x363d4b > _0x1b955a);
        let _0x3ae5ef = _0x3944fd.x;
        let _0x9ac3b6 = _0x3944fd.x - 1 + (_0x3944fd.colSpan || 1);
        let _0x429431 = _0x365e9a.x;
        let _0x3dd8dd = _0x365e9a.x - 1 + (_0x365e9a.colSpan || 1);
        let _0x3ac3e1 = !(_0x3ae5ef > _0x3dd8dd) && !(_0x429431 > _0x9ac3b6);
        return _0x4710c0 && _0x3ac3e1;
      }
      function _0x339add(_0x2107d1, _0x305d53, _0x5774aa) {
        let _0x314a10 = Math.min(_0x2107d1.length - 1, _0x5774aa);
        const _0x194807 = {
          x: _0x305d53,
          y: _0x5774aa
        };
        let _0x132aa0 = _0x194807;
        for (let _0x50c7ee = 0; _0x50c7ee <= _0x314a10; _0x50c7ee++) {
          let _0x541aa5 = _0x2107d1[_0x50c7ee];
          for (let _0x4e2b17 = 0; _0x4e2b17 < _0x541aa5.length; _0x4e2b17++) {
            if (_0x5bf6d8(_0x132aa0, _0x541aa5[_0x4e2b17])) {
              return true;
            }
          }
        }
        return false;
      }
      function _0x7b5de4(_0x143bbd, _0x3b1b32, _0x4f3c77, _0x485259) {
        for (let _0x56acb9 = _0x4f3c77; _0x56acb9 < _0x485259; _0x56acb9++) {
          if (_0x339add(_0x143bbd, _0x56acb9, _0x3b1b32)) {
            return false;
          }
        }
        return true;
      }
      function _0x3ecb7c(_0x4d55ef) {
        _0x4d55ef.forEach(function (_0x4a3ad0, _0x2f7ff6) {
          _0x4a3ad0.forEach(function (_0x3a704f) {
            for (let _0x5ea400 = 1; _0x5ea400 < _0x3a704f.rowSpan; _0x5ea400++) {
              let _0x492c06 = new _0x3aac30(_0x3a704f);
              _0x492c06.x = _0x3a704f.x;
              _0x492c06.y = _0x3a704f.y + _0x5ea400;
              _0x492c06.colSpan = _0x3a704f.colSpan;
              _0x4a844d(_0x492c06, _0x4d55ef[_0x2f7ff6 + _0x5ea400]);
            }
          });
        });
      }
      function _0x1abb48(_0x235955) {
        for (let _0x20d02d = _0x235955.length - 1; _0x20d02d >= 0; _0x20d02d--) {
          let _0x32f62d = _0x235955[_0x20d02d];
          for (let _0x2e4535 = 0; _0x2e4535 < _0x32f62d.length; _0x2e4535++) {
            let _0x5f208d = _0x32f62d[_0x2e4535];
            for (let _0x2071df = 1; _0x2071df < _0x5f208d.colSpan; _0x2071df++) {
              let _0x3c4c33 = new _0x2a4da8();
              _0x3c4c33.x = _0x5f208d.x + _0x2071df;
              _0x3c4c33.y = _0x5f208d.y;
              _0x32f62d.splice(_0x2e4535 + 1, 0, _0x3c4c33);
            }
          }
        }
      }
      function _0x4a844d(_0xc042ec, _0x2aa3d7) {
        let _0x2c258b = 0;
        while (_0x2c258b < _0x2aa3d7.length && _0x2aa3d7[_0x2c258b].x < _0xc042ec.x) {
          _0x2c258b++;
        }
        _0x2aa3d7.splice(_0x2c258b, 0, _0xc042ec);
      }
      function _0x5a23e7(_0x20b798) {
        let _0x695971 = _0x2baccf(_0x20b798);
        let _0x1ca1b1 = _0x2aa25e(_0x20b798);
        _0x5c7c81("Max rows: " + _0x695971 + "; Max cols: " + _0x1ca1b1);
        for (let _0x3e9256 = 0; _0x3e9256 < _0x695971; _0x3e9256++) {
          for (let _0x56e5a1 = 0; _0x56e5a1 < _0x1ca1b1; _0x56e5a1++) {
            if (!_0x339add(_0x20b798, _0x56e5a1, _0x3e9256)) {
              const _0x13211b = {
                x: _0x56e5a1,
                y: _0x3e9256,
                colSpan: 1,
                rowSpan: 1
              };
              let _0x7f53e4 = _0x13211b;
              _0x56e5a1++;
              while (_0x56e5a1 < _0x1ca1b1 && !_0x339add(_0x20b798, _0x56e5a1, _0x3e9256)) {
                _0x7f53e4.colSpan++;
                _0x56e5a1++;
              }
              let _0x145b44 = _0x3e9256 + 1;
              while (_0x145b44 < _0x695971 && _0x7b5de4(_0x20b798, _0x145b44, _0x7f53e4.x, _0x7f53e4.x + _0x7f53e4.colSpan)) {
                _0x7f53e4.rowSpan++;
                _0x145b44++;
              }
              let _0x280d13 = new _0x3e29f9(_0x7f53e4);
              _0x280d13.x = _0x7f53e4.x;
              _0x280d13.y = _0x7f53e4.y;
              _0x33a291("Missing cell at " + _0x280d13.y + "-" + _0x280d13.x + ".");
              _0x4a844d(_0x280d13, _0x20b798[_0x3e9256]);
            }
          }
        }
      }
      function _0x5ccf59(_0x39979d) {
        return _0x39979d.map(function (_0x1d312a) {
          if (!Array.isArray(_0x1d312a)) {
            let _0x46acf0 = Object.keys(_0x1d312a)[0];
            _0x1d312a = _0x1d312a[_0x46acf0];
            if (Array.isArray(_0x1d312a)) {
              _0x1d312a = _0x1d312a.slice();
              _0x1d312a.unshift(_0x46acf0);
            } else {
              _0x1d312a = [_0x46acf0, _0x1d312a];
            }
          }
          return _0x1d312a.map(function (_0x400509) {
            return new _0x3e29f9(_0x400509);
          });
        });
      }
      function _0x5d2854(_0x1c733c) {
        let _0x31115f = _0x5ccf59(_0x1c733c);
        _0x2f03b1(_0x31115f);
        _0x5a23e7(_0x31115f);
        _0x3ecb7c(_0x31115f);
        _0x1abb48(_0x31115f);
        return _0x31115f;
      }
      _0x3d64fc.exports = {
        makeTableLayout: _0x5d2854,
        layoutTable: _0x2f03b1,
        addRowSpanCells: _0x3ecb7c,
        maxWidth: _0x2aa25e,
        fillInTable: _0x5a23e7,
        computeWidths: _0x1c9ce6("colSpan", "desiredWidth", "x", 1),
        computeHeights: _0x1c9ce6("rowSpan", "desiredHeight", "y", 1)
      };
    })();
    function _0x1c9ce6(_0x25c9ac, _0x5b71d4, _0x4bb135, _0x186327) {
      return function (_0x35f7d6, _0x136fd5) {
        let _0x5d3f45 = [];
        let _0x45dfed = [];
        let _0x39c2f6 = {};
        _0x136fd5.forEach(function (_0x37bdc2) {
          _0x37bdc2.forEach(function (_0x421bc5) {
            if ((_0x421bc5[_0x25c9ac] || 1) > 1) {
              _0x45dfed.push(_0x421bc5);
            } else {
              _0x5d3f45[_0x421bc5[_0x4bb135]] = Math.max(_0x5d3f45[_0x421bc5[_0x4bb135]] || 0, _0x421bc5[_0x5b71d4] || 0, _0x186327);
            }
          });
        });
        _0x35f7d6.forEach(function (_0x423a9b, _0x4dfd0f) {
          if (typeof _0x423a9b === "number") {
            _0x5d3f45[_0x4dfd0f] = _0x423a9b;
          }
        });
        for (let _0x506872 = _0x45dfed.length - 1; _0x506872 >= 0; _0x506872--) {
          let _0x438f76 = _0x45dfed[_0x506872];
          let _0x44d0bf = _0x438f76[_0x25c9ac];
          let _0x519330 = _0x438f76[_0x4bb135];
          let _0x5b82c1 = _0x5d3f45[_0x519330];
          let _0x527464 = typeof _0x35f7d6[_0x519330] === "number" ? 0 : 1;
          if (typeof _0x5b82c1 === "number") {
            for (let _0x1ff05a = 1; _0x1ff05a < _0x44d0bf; _0x1ff05a++) {
              _0x5b82c1 += 1 + _0x5d3f45[_0x519330 + _0x1ff05a];
              if (typeof _0x35f7d6[_0x519330 + _0x1ff05a] !== "number") {
                _0x527464++;
              }
            }
          } else {
            _0x5b82c1 = _0x5b71d4 === "desiredWidth" ? _0x438f76.desiredWidth - 1 : 1;
            if (!_0x39c2f6[_0x519330] || _0x39c2f6[_0x519330] < _0x5b82c1) {
              _0x39c2f6[_0x519330] = _0x5b82c1;
            }
          }
          if (_0x438f76[_0x5b71d4] > _0x5b82c1) {
            let _0x10d612 = 0;
            while (_0x527464 > 0 && _0x438f76[_0x5b71d4] > _0x5b82c1) {
              if (typeof _0x35f7d6[_0x519330 + _0x10d612] !== "number") {
                let _0x5ee581 = Math.round((_0x438f76[_0x5b71d4] - _0x5b82c1) / _0x527464);
                _0x5b82c1 += _0x5ee581;
                _0x5d3f45[_0x519330 + _0x10d612] += _0x5ee581;
                _0x527464--;
              }
              _0x10d612++;
            }
          }
        }
        Object.assign(_0x35f7d6, _0x5d3f45, _0x39c2f6);
        for (let _0x14c2e0 = 0; _0x14c2e0 < _0x35f7d6.length; _0x14c2e0++) {
          _0x35f7d6[_0x14c2e0] = Math.max(_0x186327, _0x35f7d6[_0x14c2e0] || 0);
        }
      };
    }
  }
});
var debug = require_debug();
var utils = require_utils();
var tableLayout = require_layout_manager();
var Table = class extends Array {
  constructor(_0x1a46ab) {
    super();
    const _0x100e67 = utils.mergeOptions(_0x1a46ab);
    const _0x2180f2 = {
      value: _0x100e67,
      enumerable: _0x100e67.debug
    };
    Object.defineProperty(this, "options", _0x2180f2);
    if (_0x100e67.debug) {
      switch (typeof _0x100e67.debug) {
        case "boolean":
          debug.setDebugLevel(debug.WARN);
          break;
        case "number":
          debug.setDebugLevel(_0x100e67.debug);
          break;
        case "string":
          debug.setDebugLevel(parseInt(_0x100e67.debug, 10));
          break;
        default:
          debug.setDebugLevel(debug.WARN);
          debug.warn("Debug option is expected to be boolean, number, or string. Received a " + typeof _0x100e67.debug);
      }
      Object.defineProperty(this, "messages", {
        get() {
          return debug.debugMessages();
        }
      });
    }
  }
  toString() {
    let _0x1d4461 = this;
    let _0x306dca = this.options.head && this.options.head.length;
    if (_0x306dca) {
      _0x1d4461 = [this.options.head];
      if (this.length) {
        _0x1d4461.push.apply(_0x1d4461, this);
      }
    } else {
      this.options.style.head = [];
    }
    let _0x35ecde = tableLayout.makeTableLayout(_0x1d4461);
    _0x35ecde.forEach(function (_0x57a477) {
      _0x57a477.forEach(function (_0x7a5e82) {
        _0x7a5e82.mergeTableOptions(this.options, _0x35ecde);
      }, this);
    }, this);
    tableLayout.computeWidths(this.options.colWidths, _0x35ecde);
    tableLayout.computeHeights(this.options.rowHeights, _0x35ecde);
    _0x35ecde.forEach(function (_0x17fb34) {
      _0x17fb34.forEach(function (_0x175ff2) {
        _0x175ff2.init(this.options);
      }, this);
    }, this);
    let _0x217708 = [];
    for (let _0x214ccd = 0; _0x214ccd < _0x35ecde.length; _0x214ccd++) {
      let _0x31e9d3 = _0x35ecde[_0x214ccd];
      let _0xa32d41 = this.options.rowHeights[_0x214ccd];
      if (_0x214ccd === 0 || !this.options.style.compact || _0x214ccd == 1 && _0x306dca) {
        doDraw(_0x31e9d3, "top", _0x217708);
      }
      for (let _0x3c36e9 = 0; _0x3c36e9 < _0xa32d41; _0x3c36e9++) {
        doDraw(_0x31e9d3, _0x3c36e9, _0x217708);
      }
      if (_0x214ccd + 1 == _0x35ecde.length) {
        doDraw(_0x31e9d3, "bottom", _0x217708);
      }
    }
    return _0x217708.join("\n");
  }
  get width() {
    let _0x122e5b = this.toString().split("\n");
    return _0x122e5b[0].length;
  }
};
Table.reset = () => debug.reset();
function doDraw(_0x218f2d, _0x13958f, _0x1f45e9) {
  let _0x5e3548 = [];
  _0x218f2d.forEach(function (_0x385796) {
    _0x5e3548.push(_0x385796.draw(_0x13958f));
  });
  let _0x3fc6f0 = _0x5e3548.join("");
  if (_0x3fc6f0.length) {
    _0x1f45e9.push(_0x3fc6f0);
  }
}
module.exports = Table;