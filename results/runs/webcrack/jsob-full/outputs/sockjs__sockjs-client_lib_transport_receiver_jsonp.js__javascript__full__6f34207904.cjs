'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x39502b, _0x306cd2) => function _0x170d6f() {
  if (!_0x306cd2) {
    (0, _0x39502b[__getOwnPropNames(_0x39502b)[0]])((_0x306cd2 = {
      exports: {}
    }).exports, _0x306cd2);
  }
  return _0x306cd2.exports;
};
var require_random = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/random.js"(_0x147fe6, _0x4e0cec) {
    'use strict';

    var _0x28f2d7 = require("crypto");
    var _0x2a54e6 = "abcdefghijklmnopqrstuvwxyz012345";
    _0x4e0cec.exports = {
      string: function (_0x2e88a0) {
        var _0xd5ee1a = _0x2a54e6.length;
        var _0x9c105c = _0x28f2d7.randomBytes(_0x2e88a0);
        var _0x1e5e9f = [];
        for (var _0x16ac56 = 0; _0x16ac56 < _0x2e88a0; _0x16ac56++) {
          _0x1e5e9f.push(_0x2a54e6.substr(_0x9c105c[_0x16ac56] % _0xd5ee1a, 1));
        }
        return _0x1e5e9f.join("");
      },
      number: function (_0x253938) {
        return Math.floor(Math.random() * _0x253938);
      },
      numberString: function (_0x1c24c3) {
        var _0x34b9d3 = ("" + (_0x1c24c3 - 1)).length;
        var _0x392b75 = new Array(_0x34b9d3 + 1).join("0");
        return (_0x392b75 + this.number(_0x1c24c3)).slice(-_0x34b9d3);
      }
    };
  }
});
var require_event = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/event.js"(_0x42924c, _0xa2c667) {
    'use strict';

    var _0x295717 = require_random();
    var _0x58c4d3 = {};
    var _0x5f53a6 = false;
    var _0x350a38 = global.chrome && global.chrome.app && global.chrome.app.runtime;
    _0xa2c667.exports = {
      attachEvent: function (_0x3697f2, _0x124ad0) {
        if (typeof global.addEventListener !== "undefined") {
          global.addEventListener(_0x3697f2, _0x124ad0, false);
        } else if (global.document && global.attachEvent) {
          global.document.attachEvent("on" + _0x3697f2, _0x124ad0);
          global.attachEvent("on" + _0x3697f2, _0x124ad0);
        }
      },
      detachEvent: function (_0x256683, _0x360c5e) {
        if (typeof global.addEventListener !== "undefined") {
          global.removeEventListener(_0x256683, _0x360c5e, false);
        } else if (global.document && global.detachEvent) {
          global.document.detachEvent("on" + _0x256683, _0x360c5e);
          global.detachEvent("on" + _0x256683, _0x360c5e);
        }
      },
      unloadAdd: function (_0x4b5cc1) {
        if (_0x350a38) {
          return null;
        }
        var _0x5b6551 = _0x295717.string(8);
        _0x58c4d3[_0x5b6551] = _0x4b5cc1;
        if (_0x5f53a6) {
          setTimeout(this.triggerUnloadCallbacks, 0);
        }
        return _0x5b6551;
      },
      unloadDel: function (_0x28605e) {
        if (_0x28605e in _0x58c4d3) {
          delete _0x58c4d3[_0x28605e];
        }
      },
      triggerUnloadCallbacks: function () {
        for (var _0xe4fba0 in _0x58c4d3) {
          _0x58c4d3[_0xe4fba0]();
          delete _0x58c4d3[_0xe4fba0];
        }
      }
    };
    function _0x4c3d30() {
      if (_0x5f53a6) {
        return;
      }
      _0x5f53a6 = true;
      _0xa2c667.exports.triggerUnloadCallbacks();
    }
    function _0x2ba3da(_0x4410fd) {
      if (!_0x4410fd.persisted) {
        _0x4c3d30();
      }
    }
    if (!_0x350a38) {
      if ("onpagehide" in global) {
        _0xa2c667.exports.attachEvent("pagehide", _0x2ba3da);
      } else {
        _0xa2c667.exports.attachEvent("unload", _0x4c3d30);
      }
    }
  }
});
var require_browser = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/browser.js"(_0x14dfe7, _0x569496) {
    'use strict';

    _0x569496.exports = {
      isOpera: function () {
        return global.navigator && /opera/i.test(global.navigator.userAgent);
      },
      isKonqueror: function () {
        return global.navigator && /konqueror/i.test(global.navigator.userAgent);
      },
      hasDomain: function () {
        if (!global.document) {
          return true;
        }
        try {
          return !!global.document.domain;
        } catch (_0x2a2456) {
          return false;
        }
      }
    };
  }
});
var require_iframe = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/iframe.js"(_0x5804af, _0x594544) {
    'use strict';

    var _0x523451 = require_event();
    var _0x49d87e = require_browser();
    function _0x3db00f() {}
    if (process.env.NODE_ENV !== "production") {
      _0x3db00f = require("debug")("sockjs-client:utils:iframe");
    }
    _0x594544.exports = {
      WPrefix: "_jp",
      currentWindowId: null,
      polluteGlobalNamespace: function () {
        if (!(_0x594544.exports.WPrefix in global)) {
          global[_0x594544.exports.WPrefix] = {};
        }
      },
      postMessage: function (_0x2e620f, _0x3f2eab) {
        if (global.parent !== global) {
          global.parent.postMessage(JSON.stringify({
            windowId: _0x594544.exports.currentWindowId,
            type: _0x2e620f,
            data: _0x3f2eab || ""
          }), "*");
        } else {
          _0x3db00f("Cannot postMessage, no parent window.", _0x2e620f, _0x3f2eab);
        }
      },
      createIframe: function (_0x2f0f39, _0x423b3d) {
        var _0x2e1387 = global.document.createElement("iframe");
        var _0x84a97e;
        var _0x6723a;
        function _0x1f9363() {
          _0x3db00f("unattach");
          clearTimeout(_0x84a97e);
          try {
            _0x2e1387.onload = null;
          } catch (_0x25741a) {}
          _0x2e1387.onerror = null;
        }
        function _0xb9777d() {
          _0x3db00f("cleanup");
          if (_0x2e1387) {
            _0x1f9363();
            setTimeout(function () {
              if (_0x2e1387) {
                _0x2e1387.parentNode.removeChild(_0x2e1387);
              }
              _0x2e1387 = null;
            }, 0);
            _0x523451.unloadDel(_0x6723a);
          }
        }
        function _0x3b6593(_0x1fb1cf) {
          _0x3db00f("onerror", _0x1fb1cf);
          if (_0x2e1387) {
            _0xb9777d();
            _0x423b3d(_0x1fb1cf);
          }
        }
        function _0x5a4239(_0x4c1529, _0x22d254) {
          _0x3db00f("post", _0x4c1529, _0x22d254);
          setTimeout(function () {
            try {
              if (_0x2e1387 && _0x2e1387.contentWindow) {
                _0x2e1387.contentWindow.postMessage(_0x4c1529, _0x22d254);
              }
            } catch (_0x4f4158) {}
          }, 0);
        }
        _0x2e1387.src = _0x2f0f39;
        _0x2e1387.style.display = "none";
        _0x2e1387.style.position = "absolute";
        _0x2e1387.onerror = function () {
          _0x3b6593("onerror");
        };
        _0x2e1387.onload = function () {
          _0x3db00f("onload");
          clearTimeout(_0x84a97e);
          _0x84a97e = setTimeout(function () {
            _0x3b6593("onload timeout");
          }, 2000);
        };
        global.document.body.appendChild(_0x2e1387);
        _0x84a97e = setTimeout(function () {
          _0x3b6593("timeout");
        }, 15000);
        _0x6723a = _0x523451.unloadAdd(_0xb9777d);
        var _0x154d9f = {
          post: _0x5a4239,
          cleanup: _0xb9777d,
          loaded: _0x1f9363
        };
        return _0x154d9f;
      },
      createHtmlfile: function (_0x261fc2, _0x5db303) {
        var _0x5e1995 = ["Active"].concat("Object").join("X");
        var _0x5a177d = new global[_0x5e1995]("htmlfile");
        var _0x282a1b;
        var _0x255869;
        var _0x5c69a3;
        function _0x5903c7() {
          clearTimeout(_0x282a1b);
          _0x5c69a3.onerror = null;
        }
        function _0x531a11() {
          if (_0x5a177d) {
            _0x5903c7();
            _0x523451.unloadDel(_0x255869);
            _0x5c69a3.parentNode.removeChild(_0x5c69a3);
            _0x5c69a3 = _0x5a177d = null;
            CollectGarbage();
          }
        }
        function _0x5d3b66(_0x4c6348) {
          _0x3db00f("onerror", _0x4c6348);
          if (_0x5a177d) {
            _0x531a11();
            _0x5db303(_0x4c6348);
          }
        }
        function _0x2ff282(_0x355735, _0x13bef8) {
          try {
            setTimeout(function () {
              if (_0x5c69a3 && _0x5c69a3.contentWindow) {
                _0x5c69a3.contentWindow.postMessage(_0x355735, _0x13bef8);
              }
            }, 0);
          } catch (_0x1835e1) {}
        }
        _0x5a177d.open();
        _0x5a177d.write("<html><script>document.domain=\"" + global.document.domain + "\";</script></html>");
        _0x5a177d.close();
        _0x5a177d.parentWindow[_0x594544.exports.WPrefix] = global[_0x594544.exports.WPrefix];
        var _0x5e399d = _0x5a177d.createElement("div");
        _0x5a177d.body.appendChild(_0x5e399d);
        _0x5c69a3 = _0x5a177d.createElement("iframe");
        _0x5e399d.appendChild(_0x5c69a3);
        _0x5c69a3.src = _0x261fc2;
        _0x5c69a3.onerror = function () {
          _0x5d3b66("onerror");
        };
        _0x282a1b = setTimeout(function () {
          _0x5d3b66("timeout");
        }, 15000);
        _0x255869 = _0x523451.unloadAdd(_0x531a11);
        var _0x163d88 = {
          post: _0x2ff282,
          cleanup: _0x531a11,
          loaded: _0x5903c7
        };
        return _0x163d88;
      }
    };
    _0x594544.exports.iframeEnabled = false;
    if (global.document) {
      _0x594544.exports.iframeEnabled = (typeof global.postMessage === "function" || typeof global.postMessage === "object") && !_0x49d87e.isKonqueror();
    }
  }
});
var require_url = __commonJS({
  "../work/sockjs__sockjs-client/lib/utils/url.js"(_0x549690, _0x4942a1) {
    'use strict';

    var _0x4ee289 = require("url-parse");
    function _0x37aa27() {}
    if (process.env.NODE_ENV !== "production") {
      _0x37aa27 = require("debug")("sockjs-client:utils:url");
    }
    _0x4942a1.exports = {
      getOrigin: function (_0x16b52d) {
        if (!_0x16b52d) {
          return null;
        }
        var _0x236684 = new _0x4ee289(_0x16b52d);
        if (_0x236684.protocol === "file:") {
          return null;
        }
        var _0x103c52 = _0x236684.port;
        if (!_0x103c52) {
          _0x103c52 = _0x236684.protocol === "https:" ? "443" : "80";
        }
        return _0x236684.protocol + "//" + _0x236684.hostname + ":" + _0x103c52;
      },
      isOriginEqual: function (_0x2d03c4, _0x1249fd) {
        var _0x598861 = this.getOrigin(_0x2d03c4) === this.getOrigin(_0x1249fd);
        _0x37aa27("same", _0x2d03c4, _0x1249fd, _0x598861);
        return _0x598861;
      },
      isSchemeEqual: function (_0x3d14b6, _0x2ada88) {
        return _0x3d14b6.split(":")[0] === _0x2ada88.split(":")[0];
      },
      addPath: function (_0x571bcb, _0x3637e4) {
        var _0x20f441 = _0x571bcb.split("?");
        return _0x20f441[0] + _0x3637e4 + (_0x20f441[1] ? "?" + _0x20f441[1] : "");
      },
      addQuery: function (_0x43ce61, _0x5a437b) {
        return _0x43ce61 + (_0x43ce61.indexOf("?") === -1 ? "?" + _0x5a437b : "&" + _0x5a437b);
      },
      isLoopbackAddr: function (_0x458da9) {
        return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(_0x458da9) || /^\[::1\]$/.test(_0x458da9);
      }
    };
  }
});
var utils = require_iframe();
var random = require_random();
var browser = require_browser();
var urlUtils = require_url();
var inherits = require("inherits");
var EventEmitter = require("events").EventEmitter;
function debug() {}
if (process.env.NODE_ENV !== "production") {
  debug = require("debug")("sockjs-client:receiver:jsonp");
}
function JsonpReceiver(_0x45e57e) {
  debug(_0x45e57e);
  var _0x1c4016 = this;
  EventEmitter.call(this);
  utils.polluteGlobalNamespace();
  this.id = "a" + random.string(6);
  var _0x2812d2 = urlUtils.addQuery(_0x45e57e, "c=" + encodeURIComponent(utils.WPrefix + "." + this.id));
  global[utils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(_0x2812d2);
  this.timeoutId = setTimeout(function () {
    debug("timeout");
    _0x1c4016._abort(new Error("JSONP script loaded abnormally (timeout)"));
  }, JsonpReceiver.timeout);
}
inherits(JsonpReceiver, EventEmitter);
JsonpReceiver.prototype.abort = function () {
  debug("abort");
  if (global[utils.WPrefix][this.id]) {
    var _0xf0c62a = new Error("JSONP user aborted read");
    _0xf0c62a.code = 1000;
    this._abort(_0xf0c62a);
  }
};
JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;
JsonpReceiver.prototype._callback = function (_0x246b22) {
  debug("_callback", _0x246b22);
  this._cleanup();
  if (this.aborting) {
    return;
  }
  if (_0x246b22) {
    debug("message", _0x246b22);
    this.emit("message", _0x246b22);
  }
  this.emit("close", null, "network");
  this.removeAllListeners();
};
JsonpReceiver.prototype._abort = function (_0x117330) {
  debug("_abort", _0x117330);
  this._cleanup();
  this.aborting = true;
  this.emit("close", _0x117330.code, _0x117330.message);
  this.removeAllListeners();
};
JsonpReceiver.prototype._cleanup = function () {
  debug("_cleanup");
  clearTimeout(this.timeoutId);
  if (this.script2) {
    this.script2.parentNode.removeChild(this.script2);
    this.script2 = null;
  }
  if (this.script) {
    var _0x88868 = this.script;
    _0x88868.parentNode.removeChild(_0x88868);
    _0x88868.onreadystatechange = _0x88868.onerror = _0x88868.onload = _0x88868.onclick = null;
    this.script = null;
  }
  delete global[utils.WPrefix][this.id];
};
JsonpReceiver.prototype._scriptError = function () {
  debug("_scriptError");
  var _0x5b7b69 = this;
  if (this.errorTimer) {
    return;
  }
  this.errorTimer = setTimeout(function () {
    if (!_0x5b7b69.loadedOkay) {
      _0x5b7b69._abort(new Error("JSONP script loaded abnormally (onerror)"));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};
JsonpReceiver.prototype._createScript = function (_0x16eae1) {
  debug("_createScript", _0x16eae1);
  var _0x469a01 = this;
  var _0x5059dd = this.script = global.document.createElement("script");
  var _0x46d6ec;
  _0x5059dd.id = "a" + random.string(8);
  _0x5059dd.src = _0x16eae1;
  _0x5059dd.type = "text/javascript";
  _0x5059dd.charset = "UTF-8";
  _0x5059dd.onerror = this._scriptError.bind(this);
  _0x5059dd.onload = function () {
    debug("onload");
    _0x469a01._abort(new Error("JSONP script loaded abnormally (onload)"));
  };
  _0x5059dd.onreadystatechange = function () {
    debug("onreadystatechange", _0x5059dd.readyState);
    if (/loaded|closed/.test(_0x5059dd.readyState)) {
      if (_0x5059dd && _0x5059dd.htmlFor && _0x5059dd.onclick) {
        _0x469a01.loadedOkay = true;
        try {
          _0x5059dd.onclick();
        } catch (_0x57c4d1) {}
      }
      if (_0x5059dd) {
        _0x469a01._abort(new Error("JSONP script loaded abnormally (onreadystatechange)"));
      }
    }
  };
  if (typeof _0x5059dd.async === "undefined" && global.document.attachEvent) {
    if (!browser.isOpera()) {
      try {
        _0x5059dd.htmlFor = _0x5059dd.id;
        _0x5059dd.event = "onclick";
      } catch (_0x2c0496) {}
      _0x5059dd.async = true;
    } else {
      _0x46d6ec = this.script2 = global.document.createElement("script");
      _0x46d6ec.text = "try{var a = document.getElementById('" + _0x5059dd.id + "'); if(a)a.onerror();}catch(x){};";
      _0x5059dd.async = _0x46d6ec.async = false;
    }
  }
  if (typeof _0x5059dd.async !== "undefined") {
    _0x5059dd.async = true;
  }
  var _0x42c904 = global.document.getElementsByTagName("head")[0];
  _0x42c904.insertBefore(_0x5059dd, _0x42c904.firstChild);
  if (_0x46d6ec) {
    _0x42c904.insertBefore(_0x46d6ec, _0x42c904.firstChild);
  }
};
module.exports = JsonpReceiver;