'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x472fea, _0x5a8ec3) => function _0x563d5b() {
  if (!_0x5a8ec3) {
    (0, _0x472fea[__getOwnPropNames(_0x472fea)[0]])((_0x5a8ec3 = {
      exports: {}
    }).exports, _0x5a8ec3);
  }
  return _0x5a8ec3.exports;
};
var require_jsonapiUtil = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js"(_0xe32b71, _0x3140bc) {
    'use strict';

    var _0x12061c = require("json-api-serializer");
    var _0x2e7d87 = new _0x12061c({
      jsonapiObject: false
    });
    var _0x445b0f = {
      UserType: "users",
      AppType: "apps",
      LogType: "logs"
    };
    _0x2e7d87.register(_0x445b0f.UserType, {});
    _0x2e7d87.register(_0x445b0f.AppType, {});
    _0x2e7d87.register(_0x445b0f.LogType, {
      topLevelMeta: function (_0x4c48ab, _0x4abccc) {
        const _0x45540e = {
          filters: _0x4abccc
        };
        return _0x45540e;
      }
    });
    _0x445b0f.Serializer = _0x2e7d87;
    _0x3140bc.exports = _0x445b0f;
  }
});
var require_storageConnection = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/storageConnection.js"(_0x1397de, _0x44472d) {
    'use strict';

    var _0x4f103c = null;
    function _0x55cbe1(_0xae77a) {
      if (!_0x4f103c) {
        _0x4f103c = _0xae77a;
      }
      return _0x4f103c;
    }
    function _0xf6ad08() {
      if (!_0x4f103c) {
        throw new Error("Storage connection has not been initialized.");
      }
      return _0x4f103c;
    }
    const _0x246338 = {
      initializeStorageConnection: _0x55cbe1,
      getStorageConnection: _0xf6ad08
    };
    _0x44472d.exports = _0x246338;
  }
});
var require_helpers = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/helpers.js"(_0xd00357) {
    'use strict';

    var {
      v4: _0x2b5e07
    } = require("uuid");
    var {
      getStorageConnection: _0x1932c6
    } = require_storageConnection();
    var _0x326b34;
    _0xd00357.extractAttributes = _0x5b9ff9 => {
      if (_0x5b9ff9 && _0x5b9ff9.data && _0x5b9ff9.data.attributes) {
        return _0x5b9ff9.data.attributes;
      } else {
        return {};
      }
    };
    _0xd00357.SlackUrl = _0x1a1ab9 => {
      const _0x5ce1e7 = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return _0x5ce1e7.test(_0x1a1ab9);
    };
    _0xd00357.addJWTSecret = async () => {
      try {
        const _0x13aa1d = _0x1932c6();
        const _0x11031f = await _0x13aa1d.getConfig("jwtSecret");
        if (_0x11031f && _0x11031f.item && _0x11031f.item.key === "jwtSecret") {
          _0x326b34 = _0x11031f.item.value;
        } else {
          const _0x430c6a = _0x2b5e07();
          const _0x125b51 = await _0x13aa1d.setConfig("jwtSecret", _0x430c6a);
          if (_0x125b51 && _0x125b51.item && _0x125b51.item.key === "jwtSecret") {
            _0x326b34 = _0x125b51.item.value;
          }
        }
        return _0x326b34 || false;
      } catch (_0x2a5fa4) {
        console.error("An error occurred in addJWTSecret:", _0x2a5fa4);
        throw _0x2a5fa4;
      }
    };
    _0xd00357.getJWTSecret = () => {
      if (_0x326b34) {
        return _0x326b34;
      } else {
        return false;
      }
    };
  }
});
var Jsonapi = require_jsonapiUtil();
var {
  getStorageConnection
} = require_storageConnection();
var helpers = require_helpers();
exports.getLogs = async (_0x285528, _0x577d18) => {
  try {
    const _0x3c2e40 = _0x285528.query || {};
    let _0x1688f9;
    if (_0x3c2e40.search_terms) {
      _0x1688f9 = _0x3c2e40.search_terms.split(",");
    }
    _0x3c2e40.limit &&= parseInt(_0x3c2e40.limit);
    if (_0x3c2e40.levels) {
      _0x3c2e40.levels = _0x3c2e40.levels.split(",").map(_0x491b92 => _0x491b92.trim());
    }
    if (_0x3c2e40.level_json) {
      _0x3c2e40.level_json = _0x3c2e40.level_json && JSON.parse(_0x3c2e40.level_json).length === 0 ? [{}] : JSON.parse(_0x3c2e40.level_json);
    }
    _0x3c2e40.hostnames &&= _0x3c2e40.hostnames && JSON.parse(_0x3c2e40.hostnames).length === 0 ? [] : JSON.parse(_0x3c2e40.hostnames);
    const _0xd05076 = getStorageConnection();
    let _0x40e587 = {};
    if (_0x1688f9) {
      _0x40e587 = await _0xd05076.searchLogs(_0x1688f9, _0x3c2e40);
    } else {
      _0x40e587 = await _0xd05076.getLogs(_0x3c2e40);
    }
    if (_0x40e587 && _0x40e587.items) {
      _0x577d18.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, _0x40e587.items, _0x40e587.filters));
    } else {
      const _0xce3428 = {
        error: "Bad Request",
        message: _0x40e587 && _0x40e587.error ? _0x40e587.error : "invalid request"
      };
      const _0x4f2fdd = [_0xce3428];
      const _0x36bc66 = {
        errors: _0x4f2fdd
      };
      _0x577d18.status(400).send(_0x36bc66);
    }
  } catch (_0x3272dc) {
    console.error(_0x3272dc);
    const _0x3c3a54 = {
      error: "Internal Server Error",
      message: _0x3272dc && _0x3272dc.message ? _0x3272dc.message : "An unexpected error occurred"
    };
    const _0x1921d5 = {
      errors: [_0x3c3a54]
    };
    _0x577d18.status(500).send(_0x1921d5);
  }
};
exports.getLogsTTL = async (_0x1e125a, _0x5acf89) => {
  try {
    const _0x405a1f = getStorageConnection();
    const _0x129626 = await _0x405a1f.getConfig("logsTTL");
    if (_0x129626 && _0x129626.item) {
      _0x5acf89.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, _0x129626.item));
    } else {
      const _0x360a10 = {
        error: "Bad Request",
        message: _0x129626 && _0x129626.error ? _0x129626.error : "invalid request"
      };
      const _0x1b3c6d = [_0x360a10];
      const _0x1df1f2 = {
        errors: _0x1b3c6d
      };
      _0x5acf89.status(400).send(_0x1df1f2);
    }
  } catch (_0x28e110) {
    console.error(_0x28e110);
    const _0x54c47c = {
      error: "Internal Server Error",
      message: _0x28e110 && _0x28e110.message ? _0x28e110.message : "An unexpected error occurred"
    };
    const _0x348d4e = {
      errors: [_0x54c47c]
    };
    _0x5acf89.status(500).send(_0x348d4e);
  }
};
exports.updateLogsTTL = async (_0x450f77, _0x2433d9) => {
  try {
    const {
      ttl: _0x40c9c9
    } = helpers.extractAttributes(_0x450f77.body);
    if (_0x40c9c9) {
      const _0x4ff8ae = getStorageConnection();
      const _0x3887d6 = await _0x4ff8ae.setConfig("logsTTL", _0x40c9c9);
      if (_0x3887d6 && _0x3887d6.item) {
        await _0x4ff8ae.ensureLogsTTL();
        _0x2433d9.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, _0x3887d6.item));
      } else {
        const _0x264e27 = {
          error: "Bad Request",
          message: _0x3887d6 && _0x3887d6.error ? _0x3887d6.error : "invalid request"
        };
        const _0x122a2d = [_0x264e27];
        const _0x42ec26 = {
          errors: _0x122a2d
        };
        _0x2433d9.status(400).send(_0x42ec26);
      }
    } else {
      const _0x405280 = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x11c0b5 = {
        errors: _0x405280
      };
      _0x2433d9.status(400).send(_0x11c0b5);
    }
  } catch (_0x3084c5) {
    console.error(_0x3084c5);
    const _0x136415 = {
      error: "Internal Server Error",
      message: _0x3084c5 && _0x3084c5.message ? _0x3084c5.message : "An unexpected error occurred"
    };
    const _0x45f11b = {
      errors: [_0x136415]
    };
    _0x2433d9.status(500).send(_0x45f11b);
  }
};
exports.getLogMeta = async (_0x1fbca3, _0x19ce06) => {
  const _0x5acd2d = _0x1fbca3.params.logId;
  try {
    if (_0x5acd2d) {
      const _0x1d0bee = getStorageConnection();
      const _0x5c61cf = await _0x1d0bee.getMeta(_0x5acd2d);
      if (_0x5c61cf && _0x5c61cf.item) {
        _0x19ce06.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, _0x5c61cf.item));
      } else {
        const _0x1739e7 = [{
          error: "Bad Request",
          message: "invalid request"
        }];
        const _0x55032f = {
          errors: _0x1739e7
        };
        _0x19ce06.status(400).send(_0x55032f);
      }
    } else {
      const _0xdfa692 = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x119de8 = {
        errors: _0xdfa692
      };
      _0x19ce06.status(400).send(_0x119de8);
    }
  } catch (_0x22c4a1) {
    console.error(_0x22c4a1);
    if (_0x22c4a1.message === "storageConnection.getMeta is not a function") {
      const _0x89b10f = {
        id: _0x5acd2d,
        meta: "{}"
      };
      _0x19ce06.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, _0x89b10f));
    } else {
      const _0x124231 = {
        error: "Internal Server Error",
        message: _0x22c4a1 && _0x22c4a1.message ? _0x22c4a1.message : "An unexpected error occurred"
      };
      const _0x1769be = {
        errors: [_0x124231]
      };
      _0x19ce06.status(500).send(_0x1769be);
    }
  }
};
exports.getHostnames = async (_0x55dda0, _0xd179ed) => {
  try {
    const _0x3a8d43 = getStorageConnection();
    const _0x53dbcf = await _0x3a8d43.getHostnames();
    if (_0x53dbcf && _0x53dbcf.items) {
      const _0xeb783c = {
        hostnames: _0x53dbcf.items
      };
      const _0x5694a6 = _0xeb783c;
      _0xd179ed.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, _0x5694a6));
    } else {
      const _0xbc194 = {
        error: "Bad Request",
        message: _0x53dbcf && _0x53dbcf.error ? _0x53dbcf.error : "invalid request"
      };
      const _0x5383a9 = [_0xbc194];
      const _0x4379c5 = {
        errors: _0x5383a9
      };
      _0xd179ed.status(400).send(_0x4379c5);
    }
  } catch (_0x32aa4c) {
    console.error(_0x32aa4c);
    if (_0x32aa4c.message === "storageConnection.getHostnames is not a function") {
      _0xd179ed.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
    } else {
      const _0x4d3236 = {
        error: "Internal Server Error",
        message: _0x32aa4c && _0x32aa4c.message ? _0x32aa4c.message : "An unexpected error occurred"
      };
      const _0xfca22c = {
        errors: [_0x4d3236]
      };
      _0xd179ed.status(500).send(_0xfca22c);
    }
  }
};
exports.deleteAllLogs = async (_0x421ba5, _0x384cf3) => {
  try {
    const _0x2c4216 = getStorageConnection();
    await _0x2c4216.deleteAllLogs();
    _0x384cf3.send({
      message: "All logs have been successfully deleted."
    });
  } catch (_0x34e354) {
    console.error(_0x34e354);
    const _0x1c7288 = {
      error: "Internal Server Error",
      message: _0x34e354.message || "An unexpected error occurred while deleting logs."
    };
    const _0x431193 = {
      errors: [_0x1c7288]
    };
    _0x384cf3.status(500).send(_0x431193);
  }
};