"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js
var require_jsonapiUtil = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js"(exports2, module2) {
    "use strict";
    var JSONAPISerializer = require("json-api-serializer");
    var Serializer = new JSONAPISerializer({
      jsonapiObject: false
    });
    var Jsonapi2 = {};
    Jsonapi2.UserType = "users";
    Jsonapi2.AppType = "apps";
    Jsonapi2.LogType = "logs";
    Serializer.register(Jsonapi2.UserType, {});
    Serializer.register(Jsonapi2.AppType, {});
    Serializer.register(Jsonapi2.LogType, {
      topLevelMeta: function(data, filters) {
        return {
          filters
        };
      }
    });
    Jsonapi2.Serializer = Serializer;
    module2.exports = Jsonapi2;
  }
});

// ../work/errsole__errsole.js/lib/main/server/storageConnection.js
var require_storageConnection = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/storageConnection.js"(exports2, module2) {
    "use strict";
    var storageConnection = null;
    function initializeStorageConnection(storage) {
      if (!storageConnection) {
        storageConnection = storage;
      }
      return storageConnection;
    }
    function getStorageConnection2() {
      if (!storageConnection) {
        throw new Error("Storage connection has not been initialized.");
      }
      return storageConnection;
    }
    module2.exports = { initializeStorageConnection, getStorageConnection: getStorageConnection2 };
  }
});

// ../work/errsole__errsole.js/lib/main/server/utils/helpers.js
var require_helpers = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/helpers.js"(exports2) {
    "use strict";
    var { v4: uuidv4 } = require("uuid");
    var { getStorageConnection: getStorageConnection2 } = require_storageConnection();
    var JWT_SECRET;
    exports2.extractAttributes = (data) => {
      if (data && data.data && data.data.attributes) {
        return data.data.attributes;
      } else {
        return {};
      }
    };
    exports2.SlackUrl = (data) => {
      const urlRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return urlRegex.test(data);
    };
    exports2.addJWTSecret = async () => {
      try {
        const storageConnection = getStorageConnection2();
        const data = await storageConnection.getConfig("jwtSecret");
        if (data && data.item && data.item.key === "jwtSecret") {
          JWT_SECRET = data.item.value;
        } else {
          const newJwtSecret = uuidv4();
          const result = await storageConnection.setConfig(
            "jwtSecret",
            newJwtSecret
          );
          if (result && result.item && result.item.key === "jwtSecret") {
            JWT_SECRET = result.item.value;
          }
        }
        return JWT_SECRET || false;
      } catch (err) {
        console.error("An error occurred in addJWTSecret:", err);
        throw err;
      }
    };
    exports2.getJWTSecret = () => {
      if (JWT_SECRET) {
        return JWT_SECRET;
      } else {
        return false;
      }
    };
  }
});

// ../work/errsole__errsole.js/lib/main/server/middleware/auth.js
var jwt = require("jsonwebtoken");
var Jsonapi = require_jsonapiUtil();
var helpers = require_helpers();
var { getStorageConnection } = require_storageConnection();
exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    const errorData = {
      error: "Unauthorized",
      message: "invalid session"
    };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, errorData));
    return;
  }
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const JWT_SECRET = helpers.getJWTSecret();
  jwt.verify(token, JWT_SECRET, (err, data) => {
    if (err) {
      const errorData = {
        error: "Forbidden",
        message: "try again some time"
      };
      res.status(403).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, errorData));
      return;
    }
    req.email = data.email;
    next();
  });
};
exports.authenticateTokenWithAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    const errorData = {
      error: "Unauthorized",
      message: "invalid session"
    };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, errorData));
    return;
  }
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const JWT_SECRET = helpers.getJWTSecret();
  jwt.verify(token, JWT_SECRET, async (err, data) => {
    if (err) {
      res.status(403).send({
        errors: [{
          error: "Forbidden",
          message: "Access denied"
        }]
      });
      return;
    }
    req.email = data.email;
    const storageConnection = getStorageConnection();
    const userDetails = await storageConnection.getUserByEmail(req.email);
    if (userDetails && userDetails.item && userDetails.item.role === "admin") {
      next();
    } else {
      res.status(403).send({
        errors: [{
          error: "Forbidden",
          message: "Access denied"
        }]
      });
    }
  });
};
