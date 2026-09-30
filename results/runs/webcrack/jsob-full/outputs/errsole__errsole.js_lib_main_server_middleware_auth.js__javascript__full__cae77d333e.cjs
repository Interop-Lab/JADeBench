'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x447966, _0xe542b2) => function _0x137126() {
  if (!_0xe542b2) {
    (0, _0x447966[__getOwnPropNames(_0x447966)[0]])((_0xe542b2 = {
      exports: {}
    }).exports, _0xe542b2);
  }
  return _0xe542b2.exports;
};
var require_jsonapiUtil = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js"(_0x1a0fce, _0x419c8c) {
    'use strict';

    var _0x3df749 = require("json-api-serializer");
    var _0x2a0b7a = new _0x3df749({
      jsonapiObject: false
    });
    var _0x322031 = {
      UserType: "users",
      AppType: "apps",
      LogType: "logs"
    };
    _0x2a0b7a.register(_0x322031.UserType, {});
    _0x2a0b7a.register(_0x322031.AppType, {});
    _0x2a0b7a.register(_0x322031.LogType, {
      topLevelMeta: function (_0x42144e, _0x39b7ba) {
        var _0x287414 = {
          filters: _0x39b7ba
        };
        return _0x287414;
      }
    });
    _0x322031.Serializer = _0x2a0b7a;
    _0x419c8c.exports = _0x322031;
  }
});
var require_storageConnection = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/storageConnection.js"(_0x4456d3, _0x5f165e) {
    'use strict';

    var _0x360914 = null;
    function _0x6c0456(_0x391f5d) {
      if (!_0x360914) {
        _0x360914 = _0x391f5d;
      }
      return _0x360914;
    }
    function _0x1c7065() {
      if (!_0x360914) {
        throw new Error("Storage connection has not been initialized.");
      }
      return _0x360914;
    }
    var _0x213fcb = {
      initializeStorageConnection: _0x6c0456,
      getStorageConnection: _0x1c7065
    };
    _0x5f165e.exports = _0x213fcb;
  }
});
var require_helpers = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/helpers.js"(_0x1b5e55) {
    'use strict';

    var {
      v4: _0x460900
    } = require("uuid");
    var {
      getStorageConnection: _0x15799f
    } = require_storageConnection();
    var _0xd7bd21;
    _0x1b5e55.extractAttributes = _0x4fe474 => {
      if (_0x4fe474 && _0x4fe474.data && _0x4fe474.data.attributes) {
        return _0x4fe474.data.attributes;
      } else {
        return {};
      }
    };
    _0x1b5e55.SlackUrl = _0x47ffca => {
      const _0x17991a = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return _0x17991a.test(_0x47ffca);
    };
    _0x1b5e55.addJWTSecret = async () => {
      try {
        const _0x1daa52 = _0x15799f();
        const _0x5412c1 = await _0x1daa52.getConfig("jwtSecret");
        if (_0x5412c1 && _0x5412c1.item && _0x5412c1.item.key === "jwtSecret") {
          _0xd7bd21 = _0x5412c1.item.value;
        } else {
          const _0x492031 = _0x460900();
          const _0x11abfe = await _0x1daa52.setConfig("jwtSecret", _0x492031);
          if (_0x11abfe && _0x11abfe.item && _0x11abfe.item.key === "jwtSecret") {
            _0xd7bd21 = _0x11abfe.item.value;
          }
        }
        return _0xd7bd21 || false;
      } catch (_0x42a2af) {
        console.error("An error occurred in addJWTSecret:", _0x42a2af);
        throw _0x42a2af;
      }
    };
    _0x1b5e55.getJWTSecret = () => {
      if (_0xd7bd21) {
        return _0xd7bd21;
      } else {
        return false;
      }
    };
  }
});
var jwt = require("jsonwebtoken");
var Jsonapi = require_jsonapiUtil();
var helpers = require_helpers();
var {
  getStorageConnection
} = require_storageConnection();
exports.authenticateToken = async (_0x535ae1, _0x140412, _0x1ab226) => {
  const _0x3c2f29 = _0x535ae1.headers.authorization;
  const _0x31655f = _0x3c2f29 && _0x3c2f29.split(" ")[1];
  if (_0x31655f == null) {
    const _0x36bed9 = {
      error: "Unauthorized",
      message: "invalid session"
    };
    _0x140412.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x36bed9));
    return;
  }
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const _0xbc59a1 = helpers.getJWTSecret();
  jwt.verify(_0x31655f, _0xbc59a1, (_0x3c5a1e, _0x161a5c) => {
    if (_0x3c5a1e) {
      const _0x163e09 = {
        error: "Forbidden",
        message: "try again some time"
      };
      _0x140412.status(403).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x163e09));
      return;
    }
    _0x535ae1.email = _0x161a5c.email;
    _0x1ab226();
  });
};
exports.authenticateTokenWithAdmin = async (_0x5850a1, _0x113cf8, _0x23f86d) => {
  const _0x1d37c6 = _0x5850a1.headers.authorization;
  const _0x3f8080 = _0x1d37c6 && _0x1d37c6.split(" ")[1];
  if (_0x3f8080 == null) {
    const _0x7f33fc = {
      error: "Unauthorized",
      message: "invalid session"
    };
    _0x113cf8.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x7f33fc));
    return;
  }
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const _0x58e204 = helpers.getJWTSecret();
  jwt.verify(_0x3f8080, _0x58e204, async (_0x39da1a, _0xe499b3) => {
    if (_0x39da1a) {
      _0x113cf8.status(403).send({
        errors: [{
          error: "Forbidden",
          message: "Access denied"
        }]
      });
      return;
    }
    _0x5850a1.email = _0xe499b3.email;
    const _0x4dae09 = getStorageConnection();
    const _0x4b1568 = await _0x4dae09.getUserByEmail(_0x5850a1.email);
    if (_0x4b1568 && _0x4b1568.item && _0x4b1568.item.role === "admin") {
      _0x23f86d();
    } else {
      _0x113cf8.status(403).send({
        errors: [{
          error: "Forbidden",
          message: "Access denied"
        }]
      });
    }
  });
};