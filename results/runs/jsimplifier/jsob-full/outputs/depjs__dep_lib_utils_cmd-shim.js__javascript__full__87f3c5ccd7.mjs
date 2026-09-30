"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;
var _promises = require("fs/promises");
var _path = require("path");
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArrayLimit(r, l) {
  var t = r == null ? null : typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e;
    var n;
    var i;
    var u;
    var a = [];
    var f = true;
    var o = false;
    try {
      i = (t = t.call(r)).next;
      if (l === 0) {
        if (Object(t) !== t) {
          return;
        }
        f = false;
      } else {
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) {}
      }
    } catch (r) {
      o = true;
      n = r;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u)) {
          return;
        }
      } finally {
        if (o) {
          throw n;
        }
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) {
    return r;
  }
}
function _createForOfIteratorHelper(r, e) {
  var t = typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length == "number") {
      if (t) {
        r = t;
      }
      var _n = 0;
      var F = function F() {};
      return {
        s: F,
        n() {
          if (_n >= r.length) {
            return {
              done: true
            };
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
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if (typeof r == "string") {
      return _arrayLikeToArray(r, a);
    }
    var t = {}.toString.call(r).slice(8, -1);
    if (t === "Object" && r.constructor) {
      t = r.constructor.name;
    }
    if (t === "Map" || t === "Set") {
      return Array.from(r);
    } else if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) {
      return _arrayLikeToArray(r, a);
    } else {
      return undefined;
    }
  }
}
function _arrayLikeToArray(r, a) {
  if (a == null || a > r.length) {
    a = r.length;
  }
  for (var e = 0, n = Array(a); e < a; e++) {
    n[e] = r[e];
  }
  return n;
}
var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
var replaceDollarWithPercentPair = function replaceDollarWithPercentPair(_0x206782) {
  var _0x2a899e = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  var _0x878660 = "";
  var _0xb39bee = 0;
  var _0x563a3f;
  do {
    _0x563a3f = _0x2a899e.exec(_0x206782);
    if (_0x563a3f) {
      _0x878660 += (_0x206782.substring(_0xb39bee, _0x563a3f.index) || "") + "%" + _0x563a3f[1] + "%";
      _0xb39bee = _0x2a899e.lastIndex;
    }
  } while (_0x2a899e.lastIndex > 0);
  return _0x878660 + _0x206782.slice(_0xb39bee);
};
var convertToSetCommands = function convertToSetCommands(_0x24056b) {
  var _0x22d648 = "";
  var _iterator = _createForOfIteratorHelper(_0x24056b.split(" "));
  var _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _0x75523c = _step.value;
      var _x75523c$split = _0x75523c.split("=");
      var _x75523c$split2 = _slicedToArray(_x75523c$split, 2);
      var _0x210c6f = _x75523c$split2[0];
      var _0x166238 = _x75523c$split2[1];
      var _0x5e77ff = (_0x210c6f || "").trim();
      var _0x344066 = (_0x166238 || "").trim();
      if (_0x5e77ff && _0x344066) {
        _0x22d648 += "@SET " + _0x5e77ff + "=" + replaceDollarWithPercentPair(_0x344066) + "\r\n";
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return _0x22d648;
};
var rm = function rm(_0x2d4428) {
  return _promises.unlink(_0x2d4428).catch(function () {});
};
var writeShim = function writeShim(_0x421731, _0x387cd4, _0x573153, _0x5e2619, _0x58c901) {
  var _0xd46755 = _path.relative(_path.dirname(_0x387cd4), _0x421731).split("\\").join("/");
  var _0x39a30a = _0xd46755.split("/").join("\\");
  var _0x37e6a9 = _0xd46755;
  var _0x20b7a8;
  var _0x3cc498 = _0x573153 && _0x573153.split("\\").join("/");
  var _0x5ecd82;
  var _0x2c59b9 = _0x3cc498 && "\"" + _0x3cc498 + "$exe\"";
  var _0x5ed970;
  _0x5e2619 = _0x5e2619 || "";
  _0x58c901 = _0x58c901 || "";
  if (!_0x573153) {
    _0x573153 = "\"%dp0%\\" + _0x39a30a + "\"";
    _0x3cc498 = "\"$basedir/" + _0xd46755 + "\"";
    _0x2c59b9 = _0x3cc498;
    _0x5e2619 = "";
    _0x39a30a = "";
    _0xd46755 = "";
    _0x37e6a9 = "";
  } else {
    _0x20b7a8 = "\"%dp0%\\" + _0x573153 + ".exe\"";
    _0x5ecd82 = "\"$basedir/" + _0x573153 + "\"";
    _0x5ed970 = "\"$basedir/" + _0x573153 + "$exe\"";
    _0x39a30a = "\"%dp0%\\" + _0x39a30a + "\"";
    _0xd46755 = "\"$basedir_win/" + _0xd46755 + "\"";
    _0x37e6a9 = "\"$basedir/" + _0x37e6a9 + "\"";
  }
  var _0x47a5e8 = "@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n";
  var _0x28d1c5;
  if (_0x20b7a8) {
    _0x5e2619 = _0x5e2619.trim();
    _0x28d1c5 = _0x47a5e8 + convertToSetCommands(_0x58c901) + ("\r\nIF EXIST " + _0x20b7a8 + " (\r\n  SET \"_prog=" + _0x20b7a8.replace(/(^")|("$)/g, "") + "\"\r\n) ELSE (\r\n  SET \"_prog=" + _0x573153.replace(/(^")|("$)/g, "") + "\"\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & \"%_prog%\" " + _0x5e2619 + " " + _0x39a30a + " %*\r\n");
  } else {
    _0x28d1c5 = "" + _0x47a5e8 + _0x573153 + " " + _0x5e2619 + " " + _0x39a30a + " %*\r\n";
  }
  var _0x51bd60 = "#!/bin/sh\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")\nbasedir_win=\"$basedir\"\n\ncase `uname -a` in\n  *CYGWIN*|*MINGW*|*MSYS*)\n    if command -v cygpath > /dev/null 2>&1; then\n      basedir_win=`cygpath -w \"$basedir\"`\n    fi\n  ;;\n  *WSL2*)\n    if command -v wslpath > /dev/null 2>&1; then\n      basedir_win=\"$(wslpath -w \"$basedir\" 2> /dev/null)\"\n      if [ $? -ne 0 ] || [ -z \"$basedir_win\" ]; then\n        echo \"Error: wslpath failed to convert path. WSL environment may be misconfigured.\" >&2\n        exit 1\n      fi\n    fi\n  ;;\nesac\n\n";
  if (_0x5ecd82) {
    _0x51bd60 = _0x51bd60 + ("PROG_EXE=" + _0x5ecd82.replace(/"$/, ".exe\"") + "\nif ! [ -x \"$PROG_EXE\" ]; then\n  PROG_EXE=" + _0x5ecd82 + "\n  if ! [ -x \"$PROG_EXE\" ]; then\n    PROG_EXE=" + _0x3cc498 + "\n    if ! [ -x \"$PROG_EXE\" ]; then\n      PROG_EXE=" + _0x3cc498 + ".exe\n    fi\n  fi\nfi\n\nexec " + _0x58c901 + "\"$PROG_EXE\" " + _0x5e2619 + " " + _0xd46755 + " \"$@\"\n");
  } else {
    _0x51bd60 = _0x51bd60 + ("exec " + _0x3cc498 + " " + _0x5e2619 + " " + _0xd46755 + " \"$@\"\n");
  }
  var _0x431bf5 = "#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=\"\"\nif ($PSVersionTable.PSVersion -lt \"6.0\" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=\".exe\"\n}\n";
  if (_0x5ed970) {
    _0x431bf5 = _0x431bf5 + ("$ret=0\nif (Test-Path " + _0x5ed970 + ") {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x5ed970 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  } else {\n    & " + _0x5ed970 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  } else {\n    & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n");
  } else {
    _0x431bf5 = _0x431bf5 + ("# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n} else {\n  & " + _0x2c59b9 + " " + _0x5e2619 + " " + _0x37e6a9 + " $args\n}\nexit $LASTEXITCODE\n");
  }
  return Promise.all([_promises.writeFile(_0x387cd4 + ".ps1", _0x431bf5, "utf8"), _promises.writeFile(_0x387cd4 + ".cmd", _0x28d1c5, "utf8"), _promises.writeFile(_0x387cd4, _0x51bd60, "utf8")]).then(function () {
    return Promise.all([_promises.chmod(_0x387cd4, 493), _promises.chmod(_0x387cd4 + ".cmd", 493), _promises.chmod(_0x387cd4 + ".ps1", 493)]);
  });
};
var _0x4cedff = {
  recursive: true
};
var prepare = function prepare(_0x3c3d23, _0x1aae8f) {
  return _promises.mkdir(_path.dirname(_0x1aae8f), _0x4cedff).then(function () {
    return _promises.readFile(_0x3c3d23, "utf8");
  }).then(function (_0xaf836f) {
    var _0x5b9d76 = _0xaf836f.trim().split(/\r*\n/)[0];
    var _0x86c325 = _0x5b9d76.match(shebangExpr);
    if (!_0x86c325) {
      return writeShim(_0x3c3d23, _0x1aae8f);
    }
    return writeShim(_0x3c3d23, _0x1aae8f, _0x86c325[2], _0x86c325[3] || "", _0x86c325[1] || "");
  }, function () {
    return writeShim(_0x3c3d23, _0x1aae8f);
  });
};
var cmdShim = function cmdShim(_0x4e3401, _0x5ab56e) {
  return _promises.stat(_0x4e3401).then(function () {
    return Promise.all([rm(_0x5ab56e), rm(_0x5ab56e + ".cmd"), rm(_0x5ab56e + ".ps1")]);
  }).then(function () {
    return prepare(_0x4e3401, _0x5ab56e);
  });
};
var cmd_shim_default = exports.default = cmdShim;