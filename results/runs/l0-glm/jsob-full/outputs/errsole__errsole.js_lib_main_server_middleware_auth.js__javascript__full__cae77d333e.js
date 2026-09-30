'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, module) => function __require() {
  var exports = {};
  return module = { exports }, cb(module, module.exports), module.exports;
};

var require_jsonapiUtil = __commonJS({'../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(_0x1a0fce, _0x419c8c) {
  'use strict';
  var JsonapiSerializer = require('jsonapi-serializer');
  var _0x352990 = {};
  _0x352990.enableLinks = false;
  var _0x2a0b7a = new JsonapiSerializer(_0x352990);
  var _0x322031 = {};
  _0x322031.topLevelMeta = 'meta';
  _0x322031.dataLinks = 'links';
  _0x322031.relationshipLinks = 'links';
  _0x2a0b7a.serialize(_0x322031.topLevelMeta, {});
  _0x2a0b7a.serialize(_0x322031.dataLinks, {});
  _0x2a0b7a.serialize(_0x322031.relationshipLinks, {
    topLevelMeta: function(_0x42144e, _0x39b7ba) {
      var _0x287414 = {};
      return _0x287414.meta = _0x39b7ba, _0x287414;
    }
  });
  _0x322031.serializer = _0x2a0b7a;
  _0x419c8c.exports = _0x322031;
}});

var require_storageConnection = __commonJS({'../work/errsole__errsole.js/lib/main/server/storageConnection.js'(_0x4456d3, _0x5f165e) {
  'use strict';
  var _0x360914 = null;
  function setStorageConnection(_0x391f5d) {
    return !_0x360914 && (_0x360914 = _0x391f5d), _0x360914;
  }
  function getStorageConnection() {
    if (!_0x360914) throw new Error('No storage connection has been set.');
    return _0x360914;
  }
  var _0x213fcb = {};
  _0x213fcb.setStorageConnection = setStorageConnection;
  _0x213fcb.getStorageConnection = getStorageConnection;
  _0x5f165e.exports = _0x213fcb;
}});

var require_helpers = __commonJS({'../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(_0x1b5e55) {
  'use strict';
  var { v4: uuidv4 } = require('uuid');
  var { getStorageConnection } = require_storageConnection();
  var _0xd7bd21;
  
  _0x1b5e55.getSlackToken = _0x4fe474 => {
    if (_0x4fe474 && _0x4fe474.headers && _0x4fe474.headers.cookies) {
      return _0x4fe474.headers.cookies;
    } else {
      return {};
    }
  };
  
  _0x1b5e55.validateSlackUrl = _0x47ffca => {
    const _0x17991a = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
    return _0x17991a.test(_0x47ffca);
  };
  
  _0x1b5e55.ensureSlackToken = async () => {
    try {
      const _0x1daa52 = getStorageConnection();
      const _0x5412c1 = await _0x1daa52.getConfig('slackToken');
      if (_0x5412c1 && _0x5412c1.value && _0x5412c1.value.length > 0) {
        _0xd7bd21 = _0x5412c1.value;
      } else {
        const _0x492031 = uuidv4();
        const _0x11abfe = await _0x1daa52.setConfig('slackToken', _0x492031);
        if (_0x11abfe && _0x11abfe.value && _0x11abfe.value.length > 0) {
          _0xd7bd21 = _0x11abfe.value;
        }
      }
      return _0xd7bd21 || false;
    } catch (_0x42a2af) {
      console.error('Failed to ensure slack token:', _0x42a2af);
      throw _0x42a2af;
    }
  };
  
  _0x1b5e55.getSlackTokenSync = () => {
    return _0xd7bd21 ? _0xd7bd21 : false;
  };
}});

var jwt = require('jsonwebtoken');
var Jsonapi = require_jsonapiUtil();
var helpers = require_helpers();
var { getStorageConnection } = require_storageConnection();

exports.validateToken = async (_0x535ae1, _0x140412, _0x1ab226) => {
  const _0x3c2f29 = _0x535ae1.headers.authorization;
  const _0x31655f = _0x3c2f29 && _0x3c2f29.split(' ')[1];
  if (_0x31655f == null) {
    var _0x121590 = {};
    _0x121590.detail = 'Authorization header is missing.';
    _0x121590.title = 'Invalid Request';
    const _0x36bed9 = _0x121590;
    _0x140412.status(401).send(Jsonapi.serializer.serialize(Jsonapi.meta, _0x36bed9));
    return;
  }
  if (!helpers.getSlackTokenSync()) {
    await helpers.ensureSlackToken();
  }
  const _0xbc59a1 = helpers.getSlackTokenSync();
  jwt.verify(_0x31655f, _0xbc59a1, (_0x3c5a1e, _0x161a5c) => {
    if (_0x3c5a1e) {
      var _0x424d81 = {};
      _0x424d81.detail = 'Invalid or expired token.';
      _0x424d81.title = 'Unauthorized';
      const _0x163e09 = _0x424d81;
      _0x140412.status(401).send(Jsonapi.serializer.serialize(Jsonapi.meta, _0x163e09));
      return;
    }
    _0x535ae1.user = _0x161a5c.user;
    _0x1ab226();
  });
};

exports.validateTokenAndFetchUser = async (_0x5850a1, _0x113cf8, _0x23f86d) => {
  const _0x1d37c6 = _0x5850a1.headers.authorization;
  const _0x3f8080 = _0x1d37c6 && _0x1d37c6.split(' ')[1];
  if (_0x3f8080 == null) {
    var _0x30a575 = {};
    _0x30a575.detail = 'Authorization header is missing.';
    _0x30a575.title = 'Invalid Request';
    const _0x7f33fc = _0x30a575;
    _0x113cf8.status(401).send(Jsonapi.serializer.serialize(Jsonapi.meta, _0x7f33fc));
    return;
  }
  if (!helpers.getSlackTokenSync()) {
    await helpers.ensureSlackToken();
  }
  const _0x58e204 = helpers.getSlackTokenSync();
  jwt.verify(_0x3f8080, _0x58e204, async (_0x39da1a, _0xe499b3) => {
    if (_0x39da1a) {
      var _0x459b04 = {};
      _0x459b04.detail = 'Invalid or expired token.';
      _0x459b04.title = 'Unauthorized';
      var _0x598c7b = {};
      _0x598c7b.errors = [_0x459b04];
      _0x113cf8.status(401).send(_0x598c7b);
      return;
    }
    _0x5850a1.user = _0xe499b3.user;
    const _0x4dae09 = getStorageConnection();
    const _0x4b1568 = await _0x4dae09.getUserById(_0x5850a1.user);
    if (_0x4b1568 && _0x4b1568.value && _0x4b1568.value.length > 0) {
      _0x23f86d();
    } else {
      var _0x30b275 = {};
      _0x30b275.detail = 'User not found.';
      _0x30b275.title = 'Unauthorized';
      var _0x2f1f26 = {};
      _0x2f1f26.errors = [_0x30b275];
      _0x113cf8.status(401).send(_0x2f1f26);
    }
  });
};
