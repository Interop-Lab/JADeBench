var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x5ce028, _0x4e3a53) => function _0x18648e() {
  if (!_0x4e3a53) {
    (0, _0x5ce028[__getOwnPropNames(_0x5ce028)[0]])((_0x4e3a53 = {
      exports: {}
    }).exports, _0x4e3a53);
  }
  return _0x4e3a53.exports;
};
var require_debug = __commonJS({
  "../work/cli-table__cli-table3/src/debug.js"(_0x64d78f, _0x492a4f) {
    var _0x3bdcd2 = [];
    var _0x395f69 = 0;
    var _0x5c2176 = (_0xf622ff, _0x5984da) => {
      if (_0x395f69 >= _0x5984da) {
        _0x3bdcd2.push(_0xf622ff);
      }
    };
    _0x5c2176.WARN = 1;
    _0x5c2176.INFO = 2;
    _0x5c2176.DEBUG = 3;
    _0x5c2176.reset = () => {
      _0x3bdcd2 = [];
    };
    _0x5c2176.setDebugLevel = _0x295056 => {
      _0x395f69 = _0x295056;
    };
    _0x5c2176.warn = _0x55b12c => _0x5c2176(_0x55b12c, _0x5c2176.WARN);
    _0x5c2176.info = _0xc58323 => _0x5c2176(_0xc58323, _0x5c2176.INFO);
    _0x5c2176.debug = _0x12fc7d => _0x5c2176(_0x12fc7d, _0x5c2176.DEBUG);
    _0x5c2176.debugMessages = () => _0x3bdcd2;
    _0x492a4f.exports = _0x5c2176;
  }
});
var require_utils = __commonJS({
  "../work/cli-table__cli-table3/src/utils.js"(_0x4c8302, _0x48a74) {
    var _0x4beed5 = require("string-width");
    function _0x4d1251(_0x4690bb) {
      if (_0x4690bb) {
        return /\u001b\[((?:\d*;){0,5}\d*)m/g;
      } else {
        return /\u001b\[(?:\d*;){0,5}\d*m/g;
      }
    }
    function _0x1b251d(_0x4c8046) {
      let _0x247efd = _0x4d1251();
      let _0x15b3a8 = ("" + _0x4c8046).replace(_0x247efd, "");
      let _0x31eab2 = _0x15b3a8.split("\n");
      return _0x31eab2.reduce(function (_0x5502c5, _0x18acd7) {
        if (_0x4beed5(_0x18acd7) > _0x5502c5) {
          return _0x4beed5(_0x18acd7);
        } else {
          return _0x5502c5;
        }
      }, 0);
    }
    function _0x35ba1d(_0x40f09c, _0x3ed392) {
      return Array(_0x3ed392 + 1).join(_0x40f09c);
    }
    function _0x95b9c3(_0x14f744, _0x23fad3, _0x5222f4, _0x3f7635) {
      let _0x8c8856 = _0x1b251d(_0x14f744);
      if (_0x23fad3 + 1 >= _0x8c8856) {
        let _0x34a4d0 = _0x23fad3 - _0x8c8856;
        switch (_0x3f7635) {
          case "right":
            {
              _0x14f744 = _0x35ba1d(_0x5222f4, _0x34a4d0) + _0x14f744;
              break;
            }
          case "center":
            {
              let _0x431814 = Math.ceil(_0x34a4d0 / 2);
              let _0x1c0842 = _0x34a4d0 - _0x431814;
              _0x14f744 = _0x35ba1d(_0x5222f4, _0x1c0842) + _0x14f744 + _0x35ba1d(_0x5222f4, _0x431814);
              break;
            }
          default:
            {
              _0x14f744 = _0x14f744 + _0x35ba1d(_0x5222f4, _0x34a4d0);
              break;
            }
        }
      }
      return _0x14f744;
    }
    var _0x530de4 = {};
    function _0x46c8e5(_0x89ed5, _0x1302c6, _0x435df7) {
      _0x1302c6 = "[" + _0x1302c6 + "m";
      _0x435df7 = "[" + _0x435df7 + "m";
      const _0x570df5 = {
        set: _0x89ed5,
        to: true
      };
      _0x530de4[_0x1302c6] = _0x570df5;
      const _0x372d7 = {
        set: _0x89ed5,
        to: false
      };
      _0x530de4[_0x435df7] = _0x372d7;
      const _0x166a02 = {
        on: _0x1302c6,
        off: _0x435df7
      };
      _0x530de4[_0x89ed5] = _0x166a02;
    }
    _0x46c8e5("bold", 1, 22);
    _0x46c8e5("italics", 3, 23);
    _0x46c8e5("underline", 4, 24);
    _0x46c8e5("inverse", 7, 27);
    _0x46c8e5("strikethrough", 9, 29);
    function _0x1dc010(_0x25e238, _0x35c6f4) {
      let _0xe0a98c = _0x35c6f4[1] ? parseInt(_0x35c6f4[1].split(";")[0]) : 0;
      if (_0xe0a98c >= 30 && _0xe0a98c <= 39 || _0xe0a98c >= 90 && _0xe0a98c <= 97) {
        _0x25e238.lastForegroundAdded = _0x35c6f4[0];
        return;
      }
      if (_0xe0a98c >= 40 && _0xe0a98c <= 49 || _0xe0a98c >= 100 && _0xe0a98c <= 107) {
        _0x25e238.lastBackgroundAdded = _0x35c6f4[0];
        return;
      }
      if (_0xe0a98c === 0) {
        for (let _0x32959d in _0x25e238) {
          if (Object.prototype.hasOwnProperty.call(_0x25e238, _0x32959d)) {
            delete _0x25e238[_0x32959d];
          }
        }
        return;
      }
      let _0x3f0be0 = _0x530de4[_0x35c6f4[0]];
      if (_0x3f0be0) {
        _0x25e238[_0x3f0be0.set] = _0x3f0be0.to;
      }
    }
    function _0x1ec703(_0x18f8ec) {
      let _0x232634 = _0x4d1251(true);
      let _0x84d7e4 = _0x232634.exec(_0x18f8ec);
      let _0x538a44 = {};
      while (_0x84d7e4 !== null) {
        _0x1dc010(_0x538a44, _0x84d7e4);
        _0x84d7e4 = _0x232634.exec(_0x18f8ec);
      }
      return _0x538a44;
    }
    function _0x4012dc(_0x5ada58, _0x48bd2f) {
      let _0x35db95 = _0x5ada58.lastBackgroundAdded;
      let _0x514488 = _0x5ada58.lastForegroundAdded;
      delete _0x5ada58.lastBackgroundAdded;
      delete _0x5ada58.lastForegroundAdded;
      Object.keys(_0x5ada58).forEach(function (_0x2506ab) {
        if (_0x5ada58[_0x2506ab]) {
          _0x48bd2f += _0x530de4[_0x2506ab].off;
        }
      });
      if (_0x35db95 && _0x35db95 != "[49m") {
        _0x48bd2f += "[49m";
      }
      if (_0x514488 && _0x514488 != "[39m") {
        _0x48bd2f += "[39m";
      }
      return _0x48bd2f;
    }
    function _0x113e66(_0x34e141, _0xbd6d) {
      let _0x4b2c0d = _0x34e141.lastBackgroundAdded;
      let _0x3266bd = _0x34e141.lastForegroundAdded;
      delete _0x34e141.lastBackgroundAdded;
      delete _0x34e141.lastForegroundAdded;
      Object.keys(_0x34e141).forEach(function (_0x5e13e7) {
        if (_0x34e141[_0x5e13e7]) {
          _0xbd6d = _0x530de4[_0x5e13e7].on + _0xbd6d;
        }
      });
      if (_0x4b2c0d && _0x4b2c0d != "[49m") {
        _0xbd6d = _0x4b2c0d + _0xbd6d;
      }
      if (_0x3266bd && _0x3266bd != "[39m") {
        _0xbd6d = _0x3266bd + _0xbd6d;
      }
      return _0xbd6d;
    }
    function _0x22fe45(_0x3df28a, _0x241854) {
      if (_0x3df28a.length === _0x1b251d(_0x3df28a)) {
        return _0x3df28a.substr(0, _0x241854);
      }
      while (_0x1b251d(_0x3df28a) > _0x241854) {
        _0x3df28a = _0x3df28a.slice(0, -1);
      }
      return _0x3df28a;
    }
    function _0x2e55e2(_0x4efbb3, _0x3d5f7e) {
      let _0x22df0d = _0x4d1251(true);
      let _0x35fa82 = _0x4efbb3.split(_0x4d1251());
      let _0x4d790a = 0;
      let _0x1556bf = 0;
      let _0x4f5f4e = "";
      let _0x132afc;
      let _0x3c9e5f = {};
      while (_0x1556bf < _0x3d5f7e) {
        _0x132afc = _0x22df0d.exec(_0x4efbb3);
        let _0x486421 = _0x35fa82[_0x4d790a];
        _0x4d790a++;
        if (_0x1556bf + _0x1b251d(_0x486421) > _0x3d5f7e) {
          _0x486421 = _0x22fe45(_0x486421, _0x3d5f7e - _0x1556bf);
        }
        _0x4f5f4e += _0x486421;
        _0x1556bf += _0x1b251d(_0x486421);
        if (_0x1556bf < _0x3d5f7e) {
          if (!_0x132afc) {
            break;
          }
          _0x4f5f4e += _0x132afc[0];
          _0x1dc010(_0x3c9e5f, _0x132afc);
        }
      }
      return _0x4012dc(_0x3c9e5f, _0x4f5f4e);
    }
    function _0x347e6c(_0x186474, _0x150e2e, _0x5682a0) {
      _0x5682a0 = _0x5682a0 || "…";
      let _0x37146d = _0x1b251d(_0x186474);
      if (_0x37146d <= _0x150e2e) {
        return _0x186474;
      }
      _0x150e2e -= _0x1b251d(_0x5682a0);
      let _0x63a511 = _0x2e55e2(_0x186474, _0x150e2e);
      _0x63a511 += _0x5682a0;
      const _0x512b58 = "]8;;";
      if (_0x186474.includes(_0x512b58) && !_0x63a511.includes(_0x512b58)) {
        _0x63a511 += _0x512b58;
      }
      return _0x63a511;
    }
    function _0x3ff269() {
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
    function _0x2129f9(_0x1e8ad0, _0x1d8811) {
      _0x1e8ad0 = _0x1e8ad0 || {};
      _0x1d8811 = _0x1d8811 || _0x3ff269();
      let _0x151d59 = Object.assign({}, _0x1d8811, _0x1e8ad0);
      _0x151d59.chars = Object.assign({}, _0x1d8811.chars, _0x1e8ad0.chars);
      _0x151d59.style = Object.assign({}, _0x1d8811.style, _0x1e8ad0.style);
      return _0x151d59;
    }
    function _0x1048a1(_0x214fea, _0x55ead7) {
      let _0x45a23f = [];
      let _0x20797d = _0x55ead7.split(/(\s+)/g);
      let _0x3ee88e = [];
      let _0x25714a = 0;
      let _0x4111c9;
      for (let _0x523a10 = 0; _0x523a10 < _0x20797d.length; _0x523a10 += 2) {
        let _0x397b47 = _0x20797d[_0x523a10];
        let _0x34a470 = _0x25714a + _0x1b251d(_0x397b47);
        if (_0x25714a > 0 && _0x4111c9) {
          _0x34a470 += _0x4111c9.length;
        }
        if (_0x34a470 > _0x214fea) {
          if (_0x25714a !== 0) {
            _0x45a23f.push(_0x3ee88e.join(""));
          }
          _0x3ee88e = [_0x397b47];
          _0x25714a = _0x1b251d(_0x397b47);
        } else {
          _0x3ee88e.push(_0x4111c9 || "", _0x397b47);
          _0x25714a = _0x34a470;
        }
        _0x4111c9 = _0x20797d[_0x523a10 + 1];
      }
      if (_0x25714a) {
        _0x45a23f.push(_0x3ee88e.join(""));
      }
      return _0x45a23f;
    }
    function _0x5ac250(_0x3e261b, _0x182212) {
      let _0x42960e = [];
      let _0x4a2337 = "";
      function _0x56e616(_0x5dcf44, _0x294cdd) {
        if (_0x4a2337.length && _0x294cdd) {
          _0x4a2337 += _0x294cdd;
        }
        _0x4a2337 += _0x5dcf44;
        while (_0x4a2337.length > _0x3e261b) {
          _0x42960e.push(_0x4a2337.slice(0, _0x3e261b));
          _0x4a2337 = _0x4a2337.slice(_0x3e261b);
        }
      }
      let _0x392707 = _0x182212.split(/(\s+)/g);
      for (let _0x5b4b28 = 0; _0x5b4b28 < _0x392707.length; _0x5b4b28 += 2) {
        _0x56e616(_0x392707[_0x5b4b28], _0x5b4b28 && _0x392707[_0x5b4b28 - 1]);
      }
      if (_0x4a2337.length) {
        _0x42960e.push(_0x4a2337);
      }
      return _0x42960e;
    }
    function _0x2387cf(_0x3cd0b5, _0x451522, _0x133639 = true) {
      let _0x40770d = [];
      _0x451522 = _0x451522.split("\n");
      const _0x12370e = _0x133639 ? _0x1048a1 : _0x5ac250;
      for (let _0x36ea92 = 0; _0x36ea92 < _0x451522.length; _0x36ea92++) {
        _0x40770d.push.apply(_0x40770d, _0x12370e(_0x3cd0b5, _0x451522[_0x36ea92]));
      }
      return _0x40770d;
    }
    function _0x208871(_0x1a0985) {
      let _0x4ac69c = {};
      let _0xa53211 = [];
      for (let _0x3c7ef3 = 0; _0x3c7ef3 < _0x1a0985.length; _0x3c7ef3++) {
        let _0x5d896f = _0x113e66(_0x4ac69c, _0x1a0985[_0x3c7ef3]);
        _0x4ac69c = _0x1ec703(_0x5d896f);
        let _0x23def3 = Object.assign({}, _0x4ac69c);
        _0xa53211.push(_0x4012dc(_0x23def3, _0x5d896f));
      }
      return _0xa53211;
    }
    function _0x5207b9(_0x8431f2, _0x5b9d05) {
      const _0x306234 = "]";
      const _0x4a0b26 = "";
      const _0x4eac21 = ";";
      return [_0x306234, "8", _0x4eac21, _0x4eac21, _0x8431f2 || _0x5b9d05, _0x4a0b26, _0x5b9d05, _0x306234, "8", _0x4eac21, _0x4eac21, _0x4a0b26].join("");
    }
    function _0x2a1a3a(_0xef0f9) {
      const _0x1f3445 = /#[0-9a-fA-F]{3,6}/;
      const [_0x3de457] = _0xef0f9.match(_0x1f3445) || ["#000"];
      return _0x3de457;
    }
    const _0x580bfb = {
      strlen: _0x1b251d,
      repeat: _0x35ba1d,
      pad: _0x95b9c3,
      truncate: _0x347e6c,
      mergeOptions: _0x2129f9,
      wordWrap: _0x2387cf,
      colorizeLines: _0x208871,
      hyperlink: _0x5207b9,
      parseHexValue: _0x2a1a3a
    };
    _0x48a74.exports = _0x580bfb;
  }
});
var {
  info,
  debug
} = require_debug();
var utils = require_utils();
var Cell = class _Cell {
  constructor(_0x1d895f) {
    this.setOptions(_0x1d895f);
    this.x = null;
    this.y = null;
  }
  setOptions(_0xdd9bd5) {
    if (["boolean", "number", "bigint", "string"].indexOf(typeof _0xdd9bd5) !== -1) {
      _0xdd9bd5 = {
        content: "" + _0xdd9bd5
      };
    }
    _0xdd9bd5 = _0xdd9bd5 || {};
    this.options = _0xdd9bd5;
    let _0x12b4de = _0xdd9bd5.content;
    if (["boolean", "number", "bigint", "string"].indexOf(typeof _0x12b4de) !== -1) {
      this.content = String(_0x12b4de);
    } else if (!_0x12b4de) {
      this.content = this.options.href || "";
    } else {
      throw new Error("Content needs to be a primitive, got: " + typeof _0x12b4de);
    }
    this.colSpan = _0xdd9bd5.colSpan || 1;
    this.rowSpan = _0xdd9bd5.rowSpan || 1;
    if (this.options.href) {
      Object.defineProperty(this, "href", {
        get() {
          return this.options.href;
        }
      });
    }
  }
  mergeTableOptions(_0x599dbe, _0x2b0a57) {
    this.cells = _0x2b0a57;
    let _0x1c8550 = this.options.chars || {};
    let _0x3cc952 = _0x599dbe.chars;
    let _0x26f3e3 = this.chars = {};
    CHAR_NAMES.forEach(function (_0x973cd3) {
      setOption(_0x1c8550, _0x3cc952, _0x973cd3, _0x26f3e3);
    });
    this.truncate = this.options.truncate || _0x599dbe.truncate;
    let _0x58ca64 = this.options.style = this.options.style || {};
    let _0x5d4009 = _0x599dbe.style;
    setOption(_0x58ca64, _0x5d4009, "padding-left", this);
    setOption(_0x58ca64, _0x5d4009, "padding-right", this);
    this.head = _0x58ca64.head || _0x5d4009.head;
    this.border = _0x58ca64.border || _0x5d4009.border;
    this.fixedWidth = _0x599dbe.colWidths[this.x];
    this.lines = this.computeLines(_0x599dbe);
    this.desiredWidth = utils.strlen(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }
  computeLines(_0x9b6bb6) {
    const _0x3729e3 = _0x9b6bb6.wordWrap || _0x9b6bb6.textWrap;
    const {
      wordWrap = _0x3729e3
    } = this.options;
    if (this.fixedWidth && wordWrap) {
      this.fixedWidth -= this.paddingLeft + this.paddingRight;
      if (this.colSpan) {
        let _0x25cd5d = 1;
        while (_0x25cd5d < this.colSpan) {
          this.fixedWidth += _0x9b6bb6.colWidths[this.x + _0x25cd5d];
          _0x25cd5d++;
        }
      }
      const {
        wrapOnWordBoundary: _0x10425e = true
      } = _0x9b6bb6;
      const {
        wrapOnWordBoundary = _0x10425e
      } = this.options;
      return this.wrapLines(utils.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
    }
    return this.wrapLines(this.content.split("\n"));
  }
  wrapLines(_0x40aabd) {
    const _0x15d88f = utils.colorizeLines(_0x40aabd);
    if (this.href) {
      return _0x15d88f.map(_0x27b06e => utils.hyperlink(this.href, _0x27b06e));
    }
    return _0x15d88f;
  }
  init(_0x1f7c74) {
    let _0x32ed0a = this.x;
    let _0x546b89 = this.y;
    this.widths = _0x1f7c74.colWidths.slice(_0x32ed0a, _0x32ed0a + this.colSpan);
    this.heights = _0x1f7c74.rowHeights.slice(_0x546b89, _0x546b89 + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);
    this.hAlign = this.options.hAlign || _0x1f7c74.colAligns[_0x32ed0a];
    this.vAlign = this.options.vAlign || _0x1f7c74.rowAligns[_0x546b89];
    this.drawRight = _0x32ed0a + this.colSpan == _0x1f7c74.colWidths.length;
  }
  draw(_0x1f959a, _0x515bb3) {
    if (_0x1f959a == "top") {
      return this.drawTop(this.drawRight);
    }
    if (_0x1f959a == "bottom") {
      return this.drawBottom(this.drawRight);
    }
    let _0x314173 = utils.truncate(this.content, 10, this.truncate);
    if (!_0x1f959a) {
      info(this.y + "-" + this.x + ": " + (this.rowSpan - _0x1f959a) + "x" + this.colSpan + " Cell " + _0x314173);
    } else {}
    let _0x37f320 = Math.max(this.height - this.lines.length, 0);
    let _0x50a8ba;
    switch (this.vAlign) {
      case "center":
        _0x50a8ba = Math.ceil(_0x37f320 / 2);
        break;
      case "bottom":
        _0x50a8ba = _0x37f320;
        break;
      default:
        _0x50a8ba = 0;
    }
    if (_0x1f959a < _0x50a8ba || _0x1f959a >= _0x50a8ba + this.lines.length) {
      return this.drawEmpty(this.drawRight, _0x515bb3);
    }
    let _0x5b8188 = this.lines.length > this.height && _0x1f959a + 1 >= this.height;
    return this.drawLine(_0x1f959a - _0x50a8ba, this.drawRight, _0x5b8188, _0x515bb3);
  }
  drawTop(_0x34aa15) {
    let _0x3077b1 = [];
    if (this.cells) {
      this.widths.forEach(function (_0xb9990b, _0x3230b9) {
        _0x3077b1.push(this._topLeftChar(_0x3230b9));
        _0x3077b1.push(utils.repeat(this.chars[this.y == 0 ? "top" : "mid"], _0xb9990b));
      }, this);
    } else {
      _0x3077b1.push(this._topLeftChar(0));
      _0x3077b1.push(utils.repeat(this.chars[this.y == 0 ? "top" : "mid"], this.width));
    }
    if (_0x34aa15) {
      _0x3077b1.push(this.chars[this.y == 0 ? "topRight" : "rightMid"]);
    }
    return this.wrapWithStyleColors("border", _0x3077b1.join(""));
  }
  _topLeftChar(_0xfe6d81) {
    let _0x416405 = this.x + _0xfe6d81;
    let _0x2cbab8;
    if (this.y == 0) {
      _0x2cbab8 = _0x416405 == 0 ? "topLeft" : _0xfe6d81 == 0 ? "topMid" : "top";
    } else if (_0x416405 == 0) {
      _0x2cbab8 = "leftMid";
    } else {
      _0x2cbab8 = _0xfe6d81 == 0 ? "midMid" : "bottomMid";
      if (this.cells) {
        let _0x2ff625 = this.cells[this.y - 1][_0x416405] instanceof _Cell.ColSpanCell;
        if (_0x2ff625) {
          _0x2cbab8 = _0xfe6d81 == 0 ? "topMid" : "mid";
        }
        if (_0xfe6d81 == 0) {
          let _0x763cf3 = 1;
          while (this.cells[this.y][_0x416405 - _0x763cf3] instanceof _Cell.ColSpanCell) {
            _0x763cf3++;
          }
          if (this.cells[this.y][_0x416405 - _0x763cf3] instanceof _Cell.RowSpanCell) {
            _0x2cbab8 = "leftMid";
          }
        }
      }
    }
    return this.chars[_0x2cbab8];
  }
  wrapWithStyleColors(_0x16486d, _0x4abc0c) {
    if (this[_0x16486d] && this[_0x16486d].length) {
      try {
        let _0x230353 = require("ansis");
        for (let _0x49f73a = this[_0x16486d].length - 1; _0x49f73a >= 0; _0x49f73a--) {
          let _0x1df3d8 = this[_0x16486d][_0x49f73a];
          let _0x47d2dd = _0x1df3d8.startsWith("hex");
          let _0x138bb4 = _0x1df3d8.startsWith("bgHex");
          if (_0x47d2dd || _0x138bb4) {
            let _0x3b666 = utils.parseHexValue(_0x1df3d8);
            _0x230353 = _0x138bb4 ? _0x230353.bgHex(_0x3b666) : _0x230353.hex(_0x3b666);
          } else {
            _0x230353 = _0x230353[_0x1df3d8];
          }
        }
        return _0x230353(_0x4abc0c);
      } catch (_0xbb7421) {
        return _0x4abc0c;
      }
    } else {
      return _0x4abc0c;
    }
  }
  drawLine(_0x422806, _0x4b8d84, _0x1f9543, _0x46568a) {
    let _0x3eea3c = this.chars[this.x == 0 ? "left" : "middle"];
    if (this.x && _0x46568a && this.cells) {
      let _0x55bd93 = this.cells[this.y + _0x46568a][this.x - 1];
      while (_0x55bd93 instanceof ColSpanCell) {
        _0x55bd93 = this.cells[_0x55bd93.y][_0x55bd93.x - 1];
      }
      if (!(_0x55bd93 instanceof RowSpanCell)) {
        _0x3eea3c = this.chars.rightMid;
      }
    }
    let _0x372e3f = utils.repeat(" ", this.paddingLeft);
    let _0x2d7150 = _0x4b8d84 ? this.chars.right : "";
    let _0xd430a9 = utils.repeat(" ", this.paddingRight);
    let _0x1e7eae = this.lines[_0x422806];
    let _0x244970 = this.width - (this.paddingLeft + this.paddingRight);
    if (_0x1f9543) {
      _0x1e7eae += this.truncate || "…";
    }
    let _0x434805 = utils.truncate(_0x1e7eae, _0x244970, this.truncate);
    _0x434805 = utils.pad(_0x434805, _0x244970, " ", this.hAlign);
    _0x434805 = _0x372e3f + _0x434805 + _0xd430a9;
    return this.stylizeLine(_0x3eea3c, _0x434805, _0x2d7150);
  }
  stylizeLine(_0x563a79, _0x4d07e0, _0x19b583) {
    _0x563a79 = this.wrapWithStyleColors("border", _0x563a79);
    _0x19b583 = this.wrapWithStyleColors("border", _0x19b583);
    if (this.y === 0) {
      _0x4d07e0 = this.wrapWithStyleColors("head", _0x4d07e0);
    }
    return _0x563a79 + _0x4d07e0 + _0x19b583;
  }
  drawBottom(_0x46adcf) {
    let _0x362ee4 = this.chars[this.x == 0 ? "bottomLeft" : "bottomMid"];
    let _0x109f33 = utils.repeat(this.chars.bottom, this.width);
    let _0x426a08 = _0x46adcf ? this.chars.bottomRight : "";
    return this.wrapWithStyleColors("border", _0x362ee4 + _0x109f33 + _0x426a08);
  }
  drawEmpty(_0x404999, _0x127260) {
    let _0x4a7b72 = this.chars[this.x == 0 ? "left" : "middle"];
    if (this.x && _0x127260 && this.cells) {
      let _0x1234e5 = this.cells[this.y + _0x127260][this.x - 1];
      while (_0x1234e5 instanceof ColSpanCell) {
        _0x1234e5 = this.cells[_0x1234e5.y][_0x1234e5.x - 1];
      }
      if (!(_0x1234e5 instanceof RowSpanCell)) {
        _0x4a7b72 = this.chars.rightMid;
      }
    }
    let _0x128edd = _0x404999 ? this.chars.right : "";
    let _0xbd8bf9 = utils.repeat(" ", this.width);
    return this.stylizeLine(_0x4a7b72, _0xbd8bf9, _0x128edd);
  }
};
var ColSpanCell = class {
  constructor() {}
  draw(_0x1d6b54) {
    if (typeof _0x1d6b54 === "number") {
      debug(this.y + "-" + this.x + ": 1x1 ColSpanCell");
    }
    return "";
  }
  init() {}
  mergeTableOptions() {}
};
var RowSpanCell = class {
  constructor(_0xa21b4c) {
    this.originalCell = _0xa21b4c;
  }
  init(_0x386ef0) {
    let _0x345502 = this.y;
    let _0x2e7641 = this.originalCell.y;
    this.cellOffset = _0x345502 - _0x2e7641;
    this.offset = findDimension(_0x386ef0.rowHeights, _0x2e7641, this.cellOffset);
  }
  draw(_0x4e1dae) {
    if (_0x4e1dae == "top") {
      return this.originalCell.draw(this.offset, this.cellOffset);
    }
    if (_0x4e1dae == "bottom") {
      return this.originalCell.draw("bottom");
    }
    debug(this.y + "-" + this.x + ": 1x" + this.colSpan + " RowSpanCell for " + this.originalCell.content);
    return this.originalCell.draw(this.offset + 1 + _0x4e1dae);
  }
  mergeTableOptions() {}
};
function firstDefined(..._0x419ce2) {
  return _0x419ce2.filter(_0x2802a3 => _0x2802a3 !== undefined && _0x2802a3 !== null).shift();
}
function setOption(_0x2b7aec, _0x591b9b, _0x420529, _0x56051c) {
  let _0x358a1c = _0x420529.split("-");
  if (_0x358a1c.length > 1) {
    _0x358a1c[1] = _0x358a1c[1].charAt(0).toUpperCase() + _0x358a1c[1].substr(1);
    _0x358a1c = _0x358a1c.join("");
    _0x56051c[_0x358a1c] = firstDefined(_0x2b7aec[_0x358a1c], _0x2b7aec[_0x420529], _0x591b9b[_0x358a1c], _0x591b9b[_0x420529]);
  } else {
    _0x56051c[_0x420529] = firstDefined(_0x2b7aec[_0x420529], _0x591b9b[_0x420529]);
  }
}
function findDimension(_0x2c793c, _0xc7eeb2, _0x10ad39) {
  let _0xe694f = _0x2c793c[_0xc7eeb2];
  for (let _0x29de89 = 1; _0x29de89 < _0x10ad39; _0x29de89++) {
    _0xe694f += 1 + _0x2c793c[_0xc7eeb2 + _0x29de89];
  }
  return _0xe694f;
}
function sumPlusOne(_0x583a8c, _0x514e73) {
  return _0x583a8c + _0x514e73 + 1;
}
var CHAR_NAMES = ["top", "top-mid", "top-left", "top-right", "bottom", "bottom-mid", "bottom-left", "bottom-right", "left", "left-mid", "mid", "mid-mid", "right", "right-mid", "middle"];
module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;