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

// ../work/errsole__errsole.js/lib/main/server/controllers/userController.js
var path = require("path");
var Jsonapi = require_jsonapiUtil();
var jwt = require("jsonwebtoken");
var helpers = require_helpers();
var { getStorageConnection } = require_storageConnection();
exports.serveIndexPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "..", "web", "index.html"));
};
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const userCountResult = await storageConnection.getUserCount();
    if (userCountResult && userCountResult.count !== 0) {
      const errorData = [{
        error: "Conflict",
        message: "Main account already created"
      }];
      res.status(409).send({ errors: errorData });
    } else {
      const createUserResult = await storageConnection.createUser({ name, email, password, role });
      if (createUserResult && createUserResult.item) {
        if (!helpers.getJWTSecret()) {
          const result = await helpers.addJWTSecret();
          if (!result) {
            const errorData = [{
              error: "Internal Server Error",
              message: "An internal server error occurred"
            }];
            res.status(500).send({ errors: errorData });
            return;
          }
        }
        const JWT_SECRET = helpers.getJWTSecret();
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1w" });
        const successData = {
          name,
          email,
          token
        };
        res.status(201).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, successData));
      } else {
        const errorData = [{
          error: "Internal Server Error",
          message: createUserResult && createUserResult.error ? createUserResult.error : "An internal server error occurred"
        }];
        res.status(500).send({ errors: errorData });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [{
        error: "Internal Server Error",
        message: error && error.message ? error.message : "An unexpected error occurred"
      }]
    });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (!helpers.getJWTSecret()) {
      const result = await helpers.addJWTSecret();
      if (!result) {
        const errorData = [{
          error: "Internal Server Error",
          message: "An internal server error occurred"
        }];
        res.status(500).send({ errors: errorData });
        return;
      }
    }
    if (email && password) {
      const verifyUserResult = await storageConnection.verifyUser(email, password);
      if (verifyUserResult && verifyUserResult.item && verifyUserResult.item.email === email) {
        const JWT_SECRET = helpers.getJWTSecret();
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1w" });
        const loginData = {
          token
        };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, loginData));
      } else {
        const errorData = [{
          error: "Unauthorized",
          message: verifyUserResult && verifyUserResult.error ? verifyUserResult.error : "Login failed, please check your credentials"
        }];
        res.status(401).send({ errors: errorData });
      }
    } else {
      res.status(400).send({ error: "Bad Request", message: "Email or password is missing" });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const storageConnection = getStorageConnection();
    if (email) {
      const userDetailsResult = await storageConnection.getUserByEmail(email);
      if (userDetailsResult && userDetailsResult.item && userDetailsResult.item.email) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userDetailsResult.item));
      } else {
        const errorData = [{
          error: "Internal Server Error",
          message: userDetailsResult && userDetailsResult.error ? userDetailsResult.error : "An internal server error occurred"
        }];
        res.status(500).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.updateUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const { name } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (email) {
      const userDetailsResult = await storageConnection.updateUserByEmail(email, { name });
      if (userDetailsResult && userDetailsResult.item && userDetailsResult.item.email === email) {
        const userData = {
          name,
          email
        };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userData));
      } else {
        const errorData = [{
          error: "Internal Server Error",
          message: userDetailsResult && userDetailsResult.error ? userDetailsResult.error : "An internal server error occurred"
        }];
        res.status(500).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.updateUserPassword = async (req, res) => {
  try {
    const email = req.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (email) {
      const userDetailsResult = await storageConnection.updatePassword(email, currentPassword, newPassword);
      if (userDetailsResult && userDetailsResult.item && userDetailsResult.item.email === email) {
        const userData = {
          email
        };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userData));
      } else {
        const errorData = [{
          error: "Internal Server Error",
          message: userDetailsResult && userDetailsResult.message ? userDetailsResult.message : "An internal server error occurred"
        }];
        res.status(500).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const email = req.email;
    const storageConnection = getStorageConnection();
    if (email) {
      const allUsersDetails = await storageConnection.getAllUsers();
      if (allUsersDetails && allUsersDetails.items) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, allUsersDetails.items));
      } else {
        throw new Error("An unexpected error occurred");
      }
    } else {
      const errorData = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.getAdminName = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const allUsersDetails = await storageConnection.getAllUsers();
    if (allUsersDetails && allUsersDetails.items) {
      const adminUser = allUsersDetails.items.find((user) => user.role === "admin");
      if (adminUser) {
        return res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { name: adminUser.name }));
      } else {
        return res.status(200).send();
      }
    } else {
      const errorData = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.addUser = async (req, res) => {
  try {
    const adminEmail = req.email;
    const { email, password, role } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (adminEmail && email && password && role) {
      const userDetails = await storageConnection.getUserByEmail(adminEmail);
      if (userDetails && userDetails.item && userDetails.item.role === "admin") {
        const createUserResult = await storageConnection.createUser({ name: "User", email, password, role });
        if (createUserResult && createUserResult.item && createUserResult.item.email === email) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, createUserResult));
        } else {
          const errorData = [{
            error: "Internal Server Error",
            message: createUserResult.error || "An internal server error occurred"
          }];
          res.status(500).send({ errors: errorData });
        }
      } else {
        const errorData = [{
          error: "Forbidden",
          message: userDetails && userDetails.error ? userDetails.error : "Not allowed"
        }];
        res.status(403).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.removeUser = async (req, res) => {
  try {
    const email = req.email;
    const userId = req.params.userId;
    const storageConnection = getStorageConnection();
    if (email && userId) {
      const userDetails = await storageConnection.getUserByEmail(email);
      if (userDetails && userDetails.item && userDetails.item.role === "admin") {
        const result = await storageConnection.deleteUser(userId);
        if (result) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result));
        } else {
          const errorData = [{
            error: "Internal Server Error",
            message: result.error || "An internal server error occurred"
          }];
          res.status(500).send({ errors: errorData });
        }
      } else {
        const errorData = [{
          error: "Forbidden",
          message: userDetails && userDetails.error ? userDetails.error : "Not allowed"
        }];
        res.status(403).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: "Bad Request",
        message: "invalid request"
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: "Internal Server Error",
      message: err ? err.message : "An unexpected error occurred"
    }];
    res.status(500).send({ errors: errorData });
  }
};
exports.getTotalUsers = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const userCountResult = await storageConnection.getUserCount();
    const data = {
      count: userCountResult.count
    };
    res.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, data));
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "An error occurred while fetching user count." });
  }
};
