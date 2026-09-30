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

// ../work/errsole__errsole.js/lib/main/server/controllers/logController.js
var Jsonapi = require_jsonapiUtil();
var { getStorageConnection } = require_storageConnection();
var helpers = require_helpers();
exports.getLogs = async (req, res) => {
  try {
    const query = req.query || {};
    let searchTerms;
    if (query.search_terms) {
      searchTerms = query.search_terms.split(",");
    }
    if (query.limit) {
      query.limit = parseInt(query.limit);
    }
    if (query.levels) {
      query.levels = query.levels.split(",").map((item) => item.trim());
    }
    if (query.level_json) {
      query.level_json = query.level_json && JSON.parse(query.level_json).length === 0 ? [{}] : JSON.parse(query.level_json);
    }
    if (query.hostnames) {
      query.hostnames = query.hostnames && JSON.parse(query.hostnames).length === 0 ? [] : JSON.parse(query.hostnames);
    }
    const storageConnection = getStorageConnection();
    let logs = {};
    if (searchTerms) {
      logs = await storageConnection.searchLogs(searchTerms, query);
    } else {
      logs = await storageConnection.getLogs(query);
    }
    if (logs && logs.items) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, logs.items, logs.filters));
    } else {
      const errorData = [
        {
          error: "Bad Request",
          message: logs && logs.error ? logs.error : "invalid request"
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.getLogsTTL = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getConfig("logsTTL");
    if (result && result.item) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      const errorData = [
        {
          error: "Bad Request",
          message: result && result.error ? result.error : "invalid request"
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.updateLogsTTL = async (req, res) => {
  try {
    const { ttl } = helpers.extractAttributes(req.body);
    if (ttl) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.setConfig("logsTTL", ttl);
      if (result && result.item) {
        await storageConnection.ensureLogsTTL();
        res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      } else {
        const errorData = [
          {
            error: "Bad Request",
            message: result && result.error ? result.error : "invalid request"
          }
        ];
        res.status(400).send({ errors: errorData });
      }
    } else {
      const errorData = [
        {
          error: "Bad Request",
          message: "invalid request"
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.getLogMeta = async (req, res) => {
  const logId = req.params.logId;
  try {
    if (logId) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.getMeta(logId);
      if (result && result.item) {
        res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      } else {
        const errorData = [
          {
            error: "Bad Request",
            message: "invalid request"
          }
        ];
        res.status(400).send({ errors: errorData });
      }
    } else {
      const errorData = [
        {
          error: "Bad Request",
          message: "invalid request"
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    if (error.message === "storageConnection.getMeta is not a function") {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { id: logId, meta: "{}" }));
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: error && error.message ? error.message : "An unexpected error occurred"
          }
        ]
      });
    }
  }
};
exports.getHostnames = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getHostnames();
    if (result && result.items) {
      const data = {
        hostnames: result.items
      };
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, data));
    } else {
      const errorData = [
        {
          error: "Bad Request",
          message: result && result.error ? result.error : "invalid request"
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    if (error.message === "storageConnection.getHostnames is not a function") {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: error && error.message ? error.message : "An unexpected error occurred"
          }
        ]
      });
    }
  }
};
exports.deleteAllLogs = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    await storageConnection.deleteAllLogs();
    res.send({
      message: "All logs have been successfully deleted."
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error.message || "An unexpected error occurred while deleting logs."
        }
      ]
    });
  }
};
