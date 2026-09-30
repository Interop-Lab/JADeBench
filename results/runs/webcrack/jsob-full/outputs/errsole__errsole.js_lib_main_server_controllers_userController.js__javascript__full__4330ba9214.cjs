'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x2463cd, _0x1cef3d) => function _0x11d608() {
  if (!_0x1cef3d) {
    (0, _0x2463cd[__getOwnPropNames(_0x2463cd)[0]])((_0x1cef3d = {
      exports: {}
    }).exports, _0x1cef3d);
  }
  return _0x1cef3d.exports;
};
var require_jsonapiUtil = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js"(_0x46198f, _0x12ef64) {
    'use strict';

    "use strict";
    var _0x4b20e6 = require("json-api-serializer");
    var _0x260a1b = new _0x4b20e6({
      jsonapiObject: false
    });
    var _0x270434 = {
      UserType: "users",
      AppType: "apps",
      LogType: "logs"
    };
    _0x260a1b.register(_0x270434.UserType, {});
    _0x260a1b.register(_0x270434.AppType, {});
    const _0x4a7536 = {
      topLevelMeta: function (_0x5bfb73, _0x2ad1a4) {
        const _0x905fb7 = {};
        _0x905fb7.filters = _0x2ad1a4;
        return _0x905fb7;
      }
    };
    _0x260a1b.register(_0x270434.LogType, _0x4a7536);
    _0x270434.Serializer = _0x260a1b;
    _0x12ef64.exports = _0x270434;
  }
});
var require_storageConnection = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/storageConnection.js"(_0xe3c085, _0x20c353) {
    'use strict';

    var _0x5593f6 = null;
    function _0x2b1d7b(_0x151597) {
      if (!_0x5593f6) {
        _0x5593f6 = _0x151597;
      }
      return _0x5593f6;
    }
    function _0x598a0c() {
      if (!_0x5593f6) {
        throw new Error("Storage connection has not been initialized.");
      }
      return _0x5593f6;
    }
    const _0x2fe61c = {
      initializeStorageConnection: _0x2b1d7b,
      getStorageConnection: _0x598a0c
    };
    _0x20c353.exports = _0x2fe61c;
  }
});
var require_helpers = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/helpers.js"(_0x3b5067) {
    'use strict';

    var {
      v4: _0x4d8614
    } = require("uuid");
    var {
      getStorageConnection: _0x386393
    } = require_storageConnection();
    var _0x5904ee;
    _0x3b5067.extractAttributes = _0x3cc5a4 => {
      if (_0x3cc5a4 && _0x3cc5a4.data && _0x3cc5a4.data.attributes) {
        return _0x3cc5a4.data.attributes;
      } else {
        return {};
      }
    };
    _0x3b5067.SlackUrl = _0x47cb4e => {
      const _0x1aac10 = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return _0x1aac10.test(_0x47cb4e);
    };
    _0x3b5067.addJWTSecret = async () => {
      try {
        const _0x23bdcb = _0x386393();
        const _0x5c5d2a = await _0x23bdcb.getConfig("jwtSecret");
        if (_0x5c5d2a && _0x5c5d2a.item && _0x5c5d2a.item.key === "jwtSecret") {
          _0x5904ee = _0x5c5d2a.item.value;
        } else {
          const _0x46768b = _0x4d8614();
          const _0x58f7b0 = await _0x23bdcb.setConfig("jwtSecret", _0x46768b);
          if (_0x58f7b0 && _0x58f7b0.item && _0x58f7b0.item.key === "jwtSecret") {
            _0x5904ee = _0x58f7b0.item.value;
          }
        }
        return _0x5904ee || false;
      } catch (_0xa12823) {
        console.error("An error occurred in addJWTSecret:", _0xa12823);
        throw _0xa12823;
      }
    };
    _0x3b5067.getJWTSecret = () => {
      if (_0x5904ee) {
        return _0x5904ee;
      } else {
        return false;
      }
    };
  }
});
var path = require("path");
var Jsonapi = require_jsonapiUtil();
var jwt = require("jsonwebtoken");
var helpers = require_helpers();
var {
  getStorageConnection
} = require_storageConnection();
exports.serveIndexPage = (_0x1d4bb4, _0x29bb91) => {
  _0x29bb91.sendFile(path.join(__dirname, "..", "..", "..", "web", "index.html"));
};
exports.createUser = async (_0x8b263e, _0x5353e8) => {
  try {
    const {
      name: _0x578e1b,
      email: _0x1d103b,
      password: _0x3acf5b,
      role: _0x4bc025
    } = helpers.extractAttributes(_0x8b263e.body);
    const _0x5d838a = getStorageConnection();
    const _0x21935c = await _0x5d838a.getUserCount();
    if (_0x21935c && _0x21935c.count !== 0) {
      const _0xf81fec = [{
        error: "Conflict",
        message: "Main account already created"
      }];
      const _0x3f135c = {
        errors: _0xf81fec
      };
      _0x5353e8.status(409).send(_0x3f135c);
    } else {
      const _0xde5a76 = {
        name: _0x578e1b,
        email: _0x1d103b,
        password: _0x3acf5b,
        role: _0x4bc025
      };
      const _0x3763e3 = await _0x5d838a.createUser(_0xde5a76);
      if (_0x3763e3 && _0x3763e3.item) {
        if (!helpers.getJWTSecret()) {
          const _0x4b5b82 = await helpers.addJWTSecret();
          if (!_0x4b5b82) {
            const _0x220ce6 = [{
              error: "Internal Server Error",
              message: "An internal server error occurred"
            }];
            const _0x87cfe = {
              errors: _0x220ce6
            };
            _0x5353e8.status(500).send(_0x87cfe);
            return;
          }
        }
        const _0x2727be = helpers.getJWTSecret();
        const _0x2d985b = {
          email: _0x1d103b
        };
        const _0x168048 = jwt.sign(_0x2d985b, _0x2727be, {
          expiresIn: "1w"
        });
        const _0x52a599 = {
          name: _0x578e1b,
          email: _0x1d103b,
          token: _0x168048
        };
        const _0x35a3f0 = _0x52a599;
        _0x5353e8.status(201).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x35a3f0));
      } else {
        const _0x2fa4af = {
          error: "Internal Server Error",
          message: _0x3763e3 && _0x3763e3.error ? _0x3763e3.error : "An internal server error occurred"
        };
        const _0xcb5a4a = [_0x2fa4af];
        const _0x221d57 = {
          errors: _0xcb5a4a
        };
        _0x5353e8.status(500).send(_0x221d57);
      }
    }
  } catch (_0x30efbd) {
    console.error(_0x30efbd);
    const _0x1122d3 = {
      error: "Internal Server Error",
      message: _0x30efbd && _0x30efbd.message ? _0x30efbd.message : "An unexpected error occurred"
    };
    const _0x2885cf = {
      errors: [_0x1122d3]
    };
    _0x5353e8.status(500).send(_0x2885cf);
  }
};
exports.loginUser = async (_0x271dd1, _0x430514) => {
  try {
    const {
      email: _0x4b4691,
      password: _0x331a74
    } = helpers.extractAttributes(_0x271dd1.body);
    const _0x12131e = getStorageConnection();
    if (!helpers.getJWTSecret()) {
      const _0x441427 = await helpers.addJWTSecret();
      if (!_0x441427) {
        const _0xb3b4de = [{
          error: "Internal Server Error",
          message: "An internal server error occurred"
        }];
        const _0x37582b = {
          errors: _0xb3b4de
        };
        _0x430514.status(500).send(_0x37582b);
        return;
      }
    }
    if (_0x4b4691 && _0x331a74) {
      const _0x42202c = await _0x12131e.verifyUser(_0x4b4691, _0x331a74);
      if (_0x42202c && _0x42202c.item && _0x42202c.item.email === _0x4b4691) {
        const _0x90a71 = helpers.getJWTSecret();
        const _0x2407c3 = {
          email: _0x4b4691
        };
        const _0x238a25 = jwt.sign(_0x2407c3, _0x90a71, {
          expiresIn: "1w"
        });
        const _0x26c66d = {
          token: _0x238a25
        };
        const _0x2224e1 = _0x26c66d;
        _0x430514.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x2224e1));
      } else {
        const _0x4fca69 = {
          error: "Unauthorized",
          message: _0x42202c && _0x42202c.error ? _0x42202c.error : "Login failed, please check your credentials"
        };
        const _0xa57abf = [_0x4fca69];
        const _0x4d0e16 = {
          errors: _0xa57abf
        };
        _0x430514.status(401).send(_0x4d0e16);
      }
    } else {
      _0x430514.status(400).send({
        error: "Bad Request",
        message: "Email or password is missing"
      });
    }
  } catch (_0x229954) {
    const _0x1b8c40 = {
      error: "Internal Server Error",
      message: _0x229954 ? _0x229954.message : "An unexpected error occurred"
    };
    const _0x297f18 = [_0x1b8c40];
    const _0x4e8cd8 = {
      errors: _0x297f18
    };
    _0x430514.status(500).send(_0x4e8cd8);
  }
};
exports.getUserProfile = async (_0x4d2cdd, _0x59434d) => {
  try {
    const _0x1ba2d0 = _0x4d2cdd.email;
    const _0xe34e1 = getStorageConnection();
    if (_0x1ba2d0) {
      const _0x5cf83a = await _0xe34e1.getUserByEmail(_0x1ba2d0);
      if (_0x5cf83a && _0x5cf83a.item && _0x5cf83a.item.email) {
        _0x59434d.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x5cf83a.item));
      } else {
        const _0x2356c1 = {
          error: "Internal Server Error",
          message: _0x5cf83a && _0x5cf83a.error ? _0x5cf83a.error : "An internal server error occurred"
        };
        const _0x4fbc14 = [_0x2356c1];
        const _0x4a87c0 = {
          errors: _0x4fbc14
        };
        _0x59434d.status(500).send(_0x4a87c0);
      }
    } else {
      const _0x45ef7e = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x565731 = {
        errors: _0x45ef7e
      };
      _0x59434d.status(400).send(_0x565731);
    }
  } catch (_0x1f23b9) {
    const _0x36cb89 = {
      error: "Internal Server Error",
      message: _0x1f23b9 ? _0x1f23b9.message : "An unexpected error occurred"
    };
    const _0x2623c1 = [_0x36cb89];
    const _0x4829bb = {
      errors: _0x2623c1
    };
    _0x59434d.status(500).send(_0x4829bb);
  }
};
exports.updateUserProfile = async (_0x409285, _0x41289f) => {
  try {
    const _0x42b996 = _0x409285.email;
    const {
      name: _0xb7a25
    } = helpers.extractAttributes(_0x409285.body);
    const _0x212415 = getStorageConnection();
    if (_0x42b996) {
      const _0x5dba7b = {
        name: _0xb7a25
      };
      const _0x5e6939 = await _0x212415.updateUserByEmail(_0x42b996, _0x5dba7b);
      if (_0x5e6939 && _0x5e6939.item && _0x5e6939.item.email === _0x42b996) {
        const _0xe60fe1 = {
          name: _0xb7a25,
          email: _0x42b996
        };
        const _0x3fabe2 = _0xe60fe1;
        _0x41289f.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x3fabe2));
      } else {
        const _0x80c45a = {
          error: "Internal Server Error",
          message: _0x5e6939 && _0x5e6939.error ? _0x5e6939.error : "An internal server error occurred"
        };
        const _0x24106e = [_0x80c45a];
        const _0x509e82 = {
          errors: _0x24106e
        };
        _0x41289f.status(500).send(_0x509e82);
      }
    } else {
      const _0x7f291d = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x3b369a = {
        errors: _0x7f291d
      };
      _0x41289f.status(400).send(_0x3b369a);
    }
  } catch (_0x5aaa09) {
    const _0x21f7f2 = {
      error: "Internal Server Error",
      message: _0x5aaa09 ? _0x5aaa09.message : "An unexpected error occurred"
    };
    const _0xfd425b = [_0x21f7f2];
    const _0x3b14c7 = {
      errors: _0xfd425b
    };
    _0x41289f.status(500).send(_0x3b14c7);
  }
};
exports.updateUserPassword = async (_0x308a6b, _0x133025) => {
  try {
    const _0x31e45f = _0x308a6b.email;
    const {
      currentPassword: _0x43d182,
      newPassword: _0x5afe9d
    } = helpers.extractAttributes(_0x308a6b.body);
    const _0x17623a = getStorageConnection();
    if (_0x31e45f) {
      const _0x55b125 = await _0x17623a.updatePassword(_0x31e45f, _0x43d182, _0x5afe9d);
      if (_0x55b125 && _0x55b125.item && _0x55b125.item.email === _0x31e45f) {
        const _0x3e1e9e = {
          email: _0x31e45f
        };
        const _0x59a25d = _0x3e1e9e;
        _0x133025.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x59a25d));
      } else {
        const _0x4171be = {
          error: "Internal Server Error",
          message: _0x55b125 && _0x55b125.message ? _0x55b125.message : "An internal server error occurred"
        };
        const _0x42fc7b = [_0x4171be];
        const _0x525007 = {
          errors: _0x42fc7b
        };
        _0x133025.status(500).send(_0x525007);
      }
    } else {
      const _0x9aa62a = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x155433 = {
        errors: _0x9aa62a
      };
      _0x133025.status(400).send(_0x155433);
    }
  } catch (_0x2ad8e6) {
    const _0x2598ee = {
      error: "Internal Server Error",
      message: _0x2ad8e6 ? _0x2ad8e6.message : "An unexpected error occurred"
    };
    const _0x5d11b6 = [_0x2598ee];
    const _0x56fc0d = {
      errors: _0x5d11b6
    };
    _0x133025.status(500).send(_0x56fc0d);
  }
};
exports.getAllUsers = async (_0x498037, _0x1279d9) => {
  try {
    const _0x41011b = _0x498037.email;
    const _0x59efe1 = getStorageConnection();
    if (_0x41011b) {
      const _0x73dc3a = await _0x59efe1.getAllUsers();
      if (_0x73dc3a && _0x73dc3a.items) {
        _0x1279d9.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x73dc3a.items));
      } else {
        throw new Error("An unexpected error occurred");
      }
    } else {
      const _0x4bae44 = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x3dbd91 = {
        errors: _0x4bae44
      };
      _0x1279d9.status(400).send(_0x3dbd91);
    }
  } catch (_0x4f2ecd) {
    const _0x55460a = {
      error: "Internal Server Error",
      message: _0x4f2ecd ? _0x4f2ecd.message : "An unexpected error occurred"
    };
    const _0x4e8143 = [_0x55460a];
    const _0x32a581 = {
      errors: _0x4e8143
    };
    _0x1279d9.status(500).send(_0x32a581);
  }
};
exports.getAdminName = async (_0x220afa, _0x1f4a33) => {
  try {
    const _0x1df86a = getStorageConnection();
    const _0x4ae945 = await _0x1df86a.getAllUsers();
    if (_0x4ae945 && _0x4ae945.items) {
      const _0x27d8ed = _0x4ae945.items.find(_0x5d1677 => _0x5d1677.role === "admin");
      if (_0x27d8ed) {
        const _0x1023be = {
          name: _0x27d8ed.name
        };
        return _0x1f4a33.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x1023be));
      } else {
        return _0x1f4a33.status(200).send();
      }
    } else {
      const _0x1698f1 = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x4e3248 = {
        errors: _0x1698f1
      };
      _0x1f4a33.status(400).send(_0x4e3248);
    }
  } catch (_0x41a3e5) {
    const _0x1a3e1a = {
      error: "Internal Server Error",
      message: _0x41a3e5 ? _0x41a3e5.message : "An unexpected error occurred"
    };
    const _0xa40677 = [_0x1a3e1a];
    const _0x455311 = {
      errors: _0xa40677
    };
    _0x1f4a33.status(500).send(_0x455311);
  }
};
exports.addUser = async (_0x1cee2d, _0x13cedf) => {
  try {
    const _0x317bc7 = _0x1cee2d.email;
    const {
      email: _0x3706ba,
      password: _0x591507,
      role: _0x4e0629
    } = helpers.extractAttributes(_0x1cee2d.body);
    const _0x1f3b5e = getStorageConnection();
    if (_0x317bc7 && _0x3706ba && _0x591507 && _0x4e0629) {
      const _0x4ee432 = await _0x1f3b5e.getUserByEmail(_0x317bc7);
      if (_0x4ee432 && _0x4ee432.item && _0x4ee432.item.role === "admin") {
        const _0x3c75ec = {
          name: "User",
          email: _0x3706ba,
          password: _0x591507,
          role: _0x4e0629
        };
        const _0x570b63 = await _0x1f3b5e.createUser(_0x3c75ec);
        if (_0x570b63 && _0x570b63.item && _0x570b63.item.email === _0x3706ba) {
          _0x13cedf.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x570b63));
        } else {
          const _0x3a2426 = {
            error: "Internal Server Error",
            message: _0x570b63.error || "An internal server error occurred"
          };
          const _0x2ab4a7 = [_0x3a2426];
          const _0x186bfb = {
            errors: _0x2ab4a7
          };
          _0x13cedf.status(500).send(_0x186bfb);
        }
      } else {
        const _0x123134 = {
          error: "Forbidden",
          message: _0x4ee432 && _0x4ee432.error ? _0x4ee432.error : "Not allowed"
        };
        const _0x118e01 = [_0x123134];
        const _0x437fd3 = {
          errors: _0x118e01
        };
        _0x13cedf.status(403).send(_0x437fd3);
      }
    } else {
      const _0x5b3162 = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x1ca2d9 = {
        errors: _0x5b3162
      };
      _0x13cedf.status(400).send(_0x1ca2d9);
    }
  } catch (_0x4480dc) {
    const _0x362ec4 = {
      error: "Internal Server Error",
      message: _0x4480dc ? _0x4480dc.message : "An unexpected error occurred"
    };
    const _0x4496b9 = [_0x362ec4];
    const _0x7cb5e6 = {
      errors: _0x4496b9
    };
    _0x13cedf.status(500).send(_0x7cb5e6);
  }
};
exports.removeUser = async (_0x3c6824, _0x479ba7) => {
  try {
    const _0x2fc974 = _0x3c6824.email;
    const _0x4f4a28 = _0x3c6824.params.userId;
    const _0x49a1fd = getStorageConnection();
    if (_0x2fc974 && _0x4f4a28) {
      const _0x2939e7 = await _0x49a1fd.getUserByEmail(_0x2fc974);
      if (_0x2939e7 && _0x2939e7.item && _0x2939e7.item.role === "admin") {
        const _0x149650 = await _0x49a1fd.deleteUser(_0x4f4a28);
        if (_0x149650) {
          _0x479ba7.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x149650));
        } else {
          const _0x306982 = {
            error: "Internal Server Error",
            message: _0x149650.error || "An internal server error occurred"
          };
          const _0x21f4b6 = [_0x306982];
          const _0x4147ac = {
            errors: _0x21f4b6
          };
          _0x479ba7.status(500).send(_0x4147ac);
        }
      } else {
        const _0x2354c8 = {
          error: "Forbidden",
          message: _0x2939e7 && _0x2939e7.error ? _0x2939e7.error : "Not allowed"
        };
        const _0x1d6e9e = [_0x2354c8];
        const _0x55423f = {
          errors: _0x1d6e9e
        };
        _0x479ba7.status(403).send(_0x55423f);
      }
    } else {
      const _0xbc5210 = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      const _0x47d5ea = {
        errors: _0xbc5210
      };
      _0x479ba7.status(400).send(_0x47d5ea);
    }
  } catch (_0x411861) {
    const _0x3f14f1 = {
      error: "Internal Server Error",
      message: _0x411861 ? _0x411861.message : "An unexpected error occurred"
    };
    const _0x379b72 = [_0x3f14f1];
    const _0x4037e9 = {
      errors: _0x379b72
    };
    _0x479ba7.status(500).send(_0x4037e9);
  }
};
exports.getTotalUsers = async (_0x5640fc, _0xd12c78) => {
  try {
    const _0x4fa44a = getStorageConnection();
    const _0x81647d = await _0x4fa44a.getUserCount();
    const _0x2b2f66 = {
      count: _0x81647d.count
    };
    const _0x437350 = _0x2b2f66;
    _0xd12c78.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, _0x437350));
  } catch (_0x85d2e) {
    console.error(_0x85d2e);
    _0xd12c78.status(500).send({
      error: "An error occurred while fetching user count."
    });
  }
};