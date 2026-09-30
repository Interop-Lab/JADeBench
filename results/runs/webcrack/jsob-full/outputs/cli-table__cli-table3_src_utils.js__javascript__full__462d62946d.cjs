var stringWidth = require("string-width");
function codeRegex(_0x182ab8) {
  if (_0x182ab8) {
    return /\u001b\[((?:\d*;){0,5}\d*)m/g;
  } else {
    return /\u001b\[(?:\d*;){0,5}\d*m/g;
  }
}
function strlen(_0x55bd58) {
  let _0x39a219 = codeRegex();
  let _0x25ba5c = ("" + _0x55bd58).replace(_0x39a219, "");
  let _0x1a7673 = _0x25ba5c.split("\n");
  return _0x1a7673.reduce(function (_0xa94ed8, _0x353ddc) {
    if (stringWidth(_0x353ddc) > _0xa94ed8) {
      return stringWidth(_0x353ddc);
    } else {
      return _0xa94ed8;
    }
  }, 0);
}
function repeat(_0x5b347f, _0x56b169) {
  return Array(_0x56b169 + 1).join(_0x5b347f);
}
function pad(_0x10a092, _0x364146, _0x5a33ec, _0x4a3278) {
  let _0x4f0c9c = strlen(_0x10a092);
  if (_0x364146 + 1 >= _0x4f0c9c) {
    let _0x14cc25 = _0x364146 - _0x4f0c9c;
    switch (_0x4a3278) {
      case "right":
        {
          _0x10a092 = repeat(_0x5a33ec, _0x14cc25) + _0x10a092;
          break;
        }
      case "center":
        {
          let _0x15c3ab = Math.ceil(_0x14cc25 / 2);
          let _0x18b996 = _0x14cc25 - _0x15c3ab;
          _0x10a092 = repeat(_0x5a33ec, _0x18b996) + _0x10a092 + repeat(_0x5a33ec, _0x15c3ab);
          break;
        }
      default:
        {
          _0x10a092 = _0x10a092 + repeat(_0x5a33ec, _0x14cc25);
          break;
        }
    }
  }
  return _0x10a092;
}
var codeCache = {};
function addToCodeCache(_0xefe8cc, _0x5ba886, _0x3dc916) {
  _0x5ba886 = "[" + _0x5ba886 + "m";
  _0x3dc916 = "[" + _0x3dc916 + "m";
  const _0x37023a = {
    set: _0xefe8cc,
    to: true
  };
  codeCache[_0x5ba886] = _0x37023a;
  const _0x3c4204 = {
    set: _0xefe8cc,
    to: false
  };
  codeCache[_0x3dc916] = _0x3c4204;
  const _0x5f29b6 = {
    on: _0x5ba886,
    off: _0x3dc916
  };
  codeCache[_0xefe8cc] = _0x5f29b6;
}
addToCodeCache("bold", 1, 22);
addToCodeCache("italics", 3, 23);
addToCodeCache("underline", 4, 24);
addToCodeCache("inverse", 7, 27);
addToCodeCache("strikethrough", 9, 29);
function updateState(_0x4da202, _0x3d2d8c) {
  let _0x57c8a8 = _0x3d2d8c[1] ? parseInt(_0x3d2d8c[1].split(";")[0]) : 0;
  if (_0x57c8a8 >= 30 && _0x57c8a8 <= 39 || _0x57c8a8 >= 90 && _0x57c8a8 <= 97) {
    _0x4da202.lastForegroundAdded = _0x3d2d8c[0];
    return;
  }
  if (_0x57c8a8 >= 40 && _0x57c8a8 <= 49 || _0x57c8a8 >= 100 && _0x57c8a8 <= 107) {
    _0x4da202.lastBackgroundAdded = _0x3d2d8c[0];
    return;
  }
  if (_0x57c8a8 === 0) {
    for (let _0x29b102 in _0x4da202) {
      if (Object.prototype.hasOwnProperty.call(_0x4da202, _0x29b102)) {
        delete _0x4da202[_0x29b102];
      }
    }
    return;
  }
  let _0x32ba9c = codeCache[_0x3d2d8c[0]];
  if (_0x32ba9c) {
    _0x4da202[_0x32ba9c.set] = _0x32ba9c.to;
  }
}
function readState(_0x2294b1) {
  let _0x288713 = codeRegex(true);
  let _0x40c875 = _0x288713.exec(_0x2294b1);
  let _0x45a752 = {};
  while (_0x40c875 !== null) {
    updateState(_0x45a752, _0x40c875);
    _0x40c875 = _0x288713.exec(_0x2294b1);
  }
  return _0x45a752;
}
function unwindState(_0x497b9e, _0xd514f7) {
  let _0x41b36f = _0x497b9e.lastBackgroundAdded;
  let _0x4f2f1a = _0x497b9e.lastForegroundAdded;
  delete _0x497b9e.lastBackgroundAdded;
  delete _0x497b9e.lastForegroundAdded;
  Object.keys(_0x497b9e).forEach(function (_0x41a2dc) {
    if (_0x497b9e[_0x41a2dc]) {
      _0xd514f7 += codeCache[_0x41a2dc].off;
    }
  });
  if (_0x41b36f && _0x41b36f != "[49m") {
    _0xd514f7 += "[49m";
  }
  if (_0x4f2f1a && _0x4f2f1a != "[39m") {
    _0xd514f7 += "[39m";
  }
  return _0xd514f7;
}
function rewindState(_0x23aa6a, _0x51205e) {
  let _0x2cf990 = _0x23aa6a.lastBackgroundAdded;
  let _0xae2f1f = _0x23aa6a.lastForegroundAdded;
  delete _0x23aa6a.lastBackgroundAdded;
  delete _0x23aa6a.lastForegroundAdded;
  Object.keys(_0x23aa6a).forEach(function (_0x2fed56) {
    if (_0x23aa6a[_0x2fed56]) {
      _0x51205e = codeCache[_0x2fed56].on + _0x51205e;
    }
  });
  if (_0x2cf990 && _0x2cf990 != "[49m") {
    _0x51205e = _0x2cf990 + _0x51205e;
  }
  if (_0xae2f1f && _0xae2f1f != "[39m") {
    _0x51205e = _0xae2f1f + _0x51205e;
  }
  return _0x51205e;
}
function truncateWidth(_0x1edfd5, _0x1ce70a) {
  if (_0x1edfd5.length === strlen(_0x1edfd5)) {
    return _0x1edfd5.substr(0, _0x1ce70a);
  }
  while (strlen(_0x1edfd5) > _0x1ce70a) {
    _0x1edfd5 = _0x1edfd5.slice(0, -1);
  }
  return _0x1edfd5;
}
function truncateWidthWithAnsi(_0x21d3e9, _0x207f1a) {
  let _0x424202 = codeRegex(true);
  let _0x1c669e = _0x21d3e9.split(codeRegex());
  let _0x4ba32c = 0;
  let _0xe8c48f = 0;
  let _0x548ffb = "";
  let _0x2149e5;
  let _0x3924a0 = {};
  while (_0xe8c48f < _0x207f1a) {
    _0x2149e5 = _0x424202.exec(_0x21d3e9);
    let _0x21595c = _0x1c669e[_0x4ba32c];
    _0x4ba32c++;
    if (_0xe8c48f + strlen(_0x21595c) > _0x207f1a) {
      _0x21595c = truncateWidth(_0x21595c, _0x207f1a - _0xe8c48f);
    }
    _0x548ffb += _0x21595c;
    _0xe8c48f += strlen(_0x21595c);
    if (_0xe8c48f < _0x207f1a) {
      if (!_0x2149e5) {
        break;
      }
      _0x548ffb += _0x2149e5[0];
      updateState(_0x3924a0, _0x2149e5);
    }
  }
  return unwindState(_0x3924a0, _0x548ffb);
}
function truncate(_0x21c3e4, _0x461556, _0x4076c4) {
  _0x4076c4 = _0x4076c4 || "…";
  let _0xd30946 = strlen(_0x21c3e4);
  if (_0xd30946 <= _0x461556) {
    return _0x21c3e4;
  }
  _0x461556 -= strlen(_0x4076c4);
  let _0xacd90f = truncateWidthWithAnsi(_0x21c3e4, _0x461556);
  _0xacd90f += _0x4076c4;
  const _0x14a0a0 = "]8;;";
  if (_0x21c3e4.includes(_0x14a0a0) && !_0xacd90f.includes(_0x14a0a0)) {
    _0xacd90f += _0x14a0a0;
  }
  return _0xacd90f;
}
function defaultOptions() {
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
function mergeOptions(_0xd39dd, _0x10ad24) {
  _0xd39dd = _0xd39dd || {};
  _0x10ad24 = _0x10ad24 || defaultOptions();
  let _0x52ceff = Object.assign({}, _0x10ad24, _0xd39dd);
  _0x52ceff.chars = Object.assign({}, _0x10ad24.chars, _0xd39dd.chars);
  _0x52ceff.style = Object.assign({}, _0x10ad24.style, _0xd39dd.style);
  return _0x52ceff;
}
function wordWrap(_0x36908a, _0xabbb6b) {
  let _0x1ef5e2 = [];
  let _0x13effe = _0xabbb6b.split(/(\s+)/g);
  let _0xb84c9d = [];
  let _0x3861ab = 0;
  let _0x59cb76;
  for (let _0x56c504 = 0; _0x56c504 < _0x13effe.length; _0x56c504 += 2) {
    let _0x369945 = _0x13effe[_0x56c504];
    let _0x21786b = _0x3861ab + strlen(_0x369945);
    if (_0x3861ab > 0 && _0x59cb76) {
      _0x21786b += _0x59cb76.length;
    }
    if (_0x21786b > _0x36908a) {
      if (_0x3861ab !== 0) {
        _0x1ef5e2.push(_0xb84c9d.join(""));
      }
      _0xb84c9d = [_0x369945];
      _0x3861ab = strlen(_0x369945);
    } else {
      _0xb84c9d.push(_0x59cb76 || "", _0x369945);
      _0x3861ab = _0x21786b;
    }
    _0x59cb76 = _0x13effe[_0x56c504 + 1];
  }
  if (_0x3861ab) {
    _0x1ef5e2.push(_0xb84c9d.join(""));
  }
  return _0x1ef5e2;
}
function textWrap(_0x1c42e5, _0x2866df) {
  let _0x350f73 = [];
  let _0x52dd92 = "";
  function _0x5cd17f(_0x319884, _0x24b438) {
    if (_0x52dd92.length && _0x24b438) {
      _0x52dd92 += _0x24b438;
    }
    _0x52dd92 += _0x319884;
    while (_0x52dd92.length > _0x1c42e5) {
      _0x350f73.push(_0x52dd92.slice(0, _0x1c42e5));
      _0x52dd92 = _0x52dd92.slice(_0x1c42e5);
    }
  }
  let _0x8c0b39 = _0x2866df.split(/(\s+)/g);
  for (let _0x3ec20d = 0; _0x3ec20d < _0x8c0b39.length; _0x3ec20d += 2) {
    _0x5cd17f(_0x8c0b39[_0x3ec20d], _0x3ec20d && _0x8c0b39[_0x3ec20d - 1]);
  }
  if (_0x52dd92.length) {
    _0x350f73.push(_0x52dd92);
  }
  return _0x350f73;
}
function multiLineWordWrap(_0x932eff, _0x3e1810, _0x478543 = true) {
  let _0x5618d9 = [];
  _0x3e1810 = _0x3e1810.split("\n");
  const _0x48ba4e = _0x478543 ? wordWrap : textWrap;
  for (let _0x4eb2e8 = 0; _0x4eb2e8 < _0x3e1810.length; _0x4eb2e8++) {
    _0x5618d9.push.apply(_0x5618d9, _0x48ba4e(_0x932eff, _0x3e1810[_0x4eb2e8]));
  }
  return _0x5618d9;
}
function colorizeLines(_0x4139da) {
  let _0x10eae8 = {};
  let _0x1ac720 = [];
  for (let _0x22dc5e = 0; _0x22dc5e < _0x4139da.length; _0x22dc5e++) {
    let _0x2da7e5 = rewindState(_0x10eae8, _0x4139da[_0x22dc5e]);
    _0x10eae8 = readState(_0x2da7e5);
    let _0x1926e0 = Object.assign({}, _0x10eae8);
    _0x1ac720.push(unwindState(_0x1926e0, _0x2da7e5));
  }
  return _0x1ac720;
}
function hyperlink(_0x3351c3, _0x3d6f03) {
  const _0x312d9e = "]";
  const _0xcd1916 = "";
  const _0x15e0e2 = ";";
  return [_0x312d9e, "8", _0x15e0e2, _0x15e0e2, _0x3351c3 || _0x3d6f03, _0xcd1916, _0x3d6f03, _0x312d9e, "8", _0x15e0e2, _0x15e0e2, _0xcd1916].join("");
}
function parseHexValue(_0x7560d8) {
  const _0x18a890 = /#[0-9a-fA-F]{3,6}/;
  const [_0x155ddc] = _0x7560d8.match(_0x18a890) || ["#000"];
  return _0x155ddc;
}
const _0x2834f5 = {
  strlen: strlen,
  repeat: repeat,
  pad: pad,
  truncate: truncate,
  mergeOptions: mergeOptions,
  wordWrap: multiLineWordWrap,
  colorizeLines: colorizeLines,
  hyperlink: hyperlink,
  parseHexValue: parseHexValue
};
module.exports = _0x2834f5;