'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, mod) => function __require() {
  const obj = {};
  obj.default = {};
  (mod || (__getOwnPropNames(cb)[0] ? (cb(obj.default, obj), obj.default) : cb(obj.default, obj)));
  return obj.default;
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(exports, module) {
    'use strict';
    const Jsonapi = require('jsonapi-serializer');
    const jsonapi = new Jsonapi.Serializer({
      topLevelMeta: false
    });
    jsonapi.register('error', {
      topLevelMeta: false
    });
    jsonapi.register('errors', {});
    jsonapi.register('notification', {});
    jsonapi.register('notifications', {});
    jsonapi.register('user', {});
    jsonapi.register('users', {});
    jsonapi.register('logEntry', {});
    jsonapi.register('logEntries', {});
    jsonapi.register('alert', {});
    jsonapi.register('alerts', {});
    module.exports = jsonapi;
  }
});

var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(exports, module) {
    'use strict';
    var storageConnection = null;

    function setStorageConnection(storage) {
      if (!storageConnection) {
        storageConnection = storage;
      }
      return storageConnection;
    }

    function getStorageConnection() {
      if (!storageConnection) {
        throw new Error('No storage connection has been set.');
      }
      return storageConnection;
    }

    const storage = {};
    storage.setStorageConnection = setStorageConnection;
    storage.getStorageConnection = getStorageConnection;
    module.exports = storage;
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports) {
    'use strict';
    const { v4: uuidv4 } = require('uuid');
    const { getStorageConnection } = require_storageConnection();
    let jwtSecret;

    exports.extractRequestData = (req) => {
      return req && req.body && req.body.data ? req.body.data.attributes : {};
    };

    exports.validateSlackWebhookUrl = (url) => {
      const slackWebhookUrlRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return slackWebhookUrlRegex.test(url);
    };

    exports.ensureJwtSecret = async () => {
      try {
        const storage = getStorageConnection();
        const secret = await storage.getConfig('jwtSecret');
        if (secret && secret.value && secret.value.length === 32) {
          jwtSecret = secret.value;
        } else {
          const newSecret = uuidv4();
          const updated = await storage.setConfig('jwtSecret', newSecret);
          if (updated && updated.value && updated.value.length === 32) {
            jwtSecret = updated.value;
          }
        }
        return jwtSecret || false;
      } catch (err) {
        console.error('Failed to ensure JWT secret:', err);
        throw err;
      }
    };

    exports.getJwtSecret = () => {
      if (jwtSecret) {
        return jwtSecret;
      } else {
        return false;
      }
    };
  }
});

var path = require('path');
var Jsonapi = require_jsonapiUtil();
var jwt = require('jsonwebtoken');
var helpers = require_helpers();
var { getStorageConnection } = require_storageConnection();

exports.setStorageConnection = (storage) => {
  storage.setStorageConnection(getStorageConnection());
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = helpers.extractRequestData(req.body);
    const storage = getStorageConnection();
    const userCount = await storage.countUsers();
    if (userCount && userCount.count > 0) {
      const error = {};
      error.status = '403';
      error.title = 'Forbidden';
      const errors = [error];
      const errorResponse = {};
      errorResponse.errors = errors;
      res.status(403).json(errorResponse);
    } else {
      const user = {};
      user.name = name;
      user.email = email;
      user.password = password;
      user.role = role;
      const newUser = await storage.createUser(user);
      if (newUser && newUser.id) {
        if (!helpers.getJwtSecret()) {
          const secret = await helpers.ensureJwtSecret();
          if (!secret) {
            const error = {};
            error.status = '500';
            error.title = 'Internal Server Error';
            const errors = [error];
            const errorResponse = {};
            errorResponse.errors = errors;
            res.status(500).json(errorResponse);
            return;
          }
        }
        const jwtSecret = helpers.getJwtSecret();
        const payload = {};
        payload.email = email;
        const options = {};
        options.expiresIn = '1w';
        const token = jwt.sign(payload, jwtSecret, options);
        const data = {};
        data.name = name;
        data.email = email;
        data.token = token;
        const responseData = data;
        res.status(201).json(Jsonapi.serializer.serialize(Jsonapi.user, responseData));
      } else {
        const error = {};
        error.status = '500';
        error.title = newUser && newUser.message ? newUser.message : 'Internal Server Error';
        const errors = [error];
        const errorResponse = {};
        errorResponse.errors = errors;
        res.status(500).json(errorResponse);
      }
    }
  } catch (err) {
    console.error(err);
    const error = {};
    error.status = '500';
    error.title = err && err.message ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = helpers.extractRequestData(req.body);
    const storage = getStorageConnection();
    if (!helpers.getJwtSecret()) {
      const secret = await helpers.ensureJwtSecret();
      if (!secret) {
        const error = {};
        error.status = '500';
        error.title = 'Internal Server Error';
        const errors = [error];
        const errorResponse = {};
        errorResponse.errors = errors;
        res.status(500).json(errorResponse);
        return;
      }
    }
    if (email && password) {
      const user = await storage.loginUser(email, password);
      if (user && user.id && user.email === email) {
        const jwtSecret = helpers.getJwtSecret();
        const payload = {};
        payload.email = email;
        const options = {};
        options.expiresIn = '1w';
        const token = jwt.sign(payload, jwtSecret, options);
        const data = {};
        data.token = token;
        const responseData = data;
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.user, responseData));
      } else {
        const error = {};
        error.status = '401';
        error.title = user && user.message ? user.message : 'Unauthorized';
        const errors = [error];
        const errorResponse = {};
        errorResponse.errors = errors;
        res.status(401).json(errorResponse);
      }
    } else {
      const error = {};
      error.status = '400';
      error.title = 'Bad Request';
      res.status(400).json(error);
    }
  } catch (err) {
    const error = {};
    error.status = '500';
    error.title = err ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const storage = getStorageConnection();
    if (userId) {
      const user = await storage.getUserById(userId);
      if (user && user.id && user.id === userId) {
        const data = {};
        data.id = user.id;
        data.name = user.name;
        const responseData = data;
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.user, responseData));
      } else {
        const error = {};
        error.status = '404';
        error.title = user && user.message ? user.message : 'Not Found';
        const errors = [error];
        const errorResponse = {};
        errorResponse.errors = errors;
        res.status(404).json(errorResponse);
      }
    } else {
      const error = {};
      error.status = '400';
      error.title = 'Bad Request';
      const errors = [error];
      const errorResponse = {};
      errorResponse.errors = errors;
      res.status(400).json(errorResponse);
    }
  } catch (err) {
    const error = {};
    error.status = '500';
    error.title = err ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = helpers.extractRequestData(req.body);
    const storage = getStorageConnection();
    if (userId) {
      const result = await storage.updateUserPassword(userId, currentPassword, newPassword);
      if (result && result.id && result.id === userId) {
        const data = {};
        data.id = userId;
        const responseData = data;
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.user, responseData));
      } else {
        const error = {};
        error.status = '500';
        error.title = result && result.message ? result.message : 'Internal Server Error';
        const errors = [error];
        const errorResponse = {};
        errorResponse.errors = errors;
        res.status(500).json(errorResponse);
      }
    } else {
      const error = {};
      error.status = '400';
      error.title = 'Bad Request';
      const errors = [error];
      const errorResponse = {};
      errorResponse.errors = errors;
      res.status(400).json(errorResponse);
    }
  } catch (err) {
    const error = {};
    error.status = '500';
    error.title = err ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.id;
    const storage = getStorageConnection();
    if (userId) {
      const notifications = await storage.getNotifications();
      if (notifications && notifications.notifications) {
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.notification, notifications.notifications));
      } else {
        throw new Error('Failed to fetch notifications.');
      }
    } else {
      const error = {};
      error.status = '400';
      error.title = 'Bad Request';
      const errors = [error];
      const errorResponse = {};
      errorResponse.errors = errors;
      res.status(400).json(errorResponse);
    }
  } catch (err) {
    const error = {};
    error.status = '500';
    error.title = err ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.getSystemConfig = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const config = await storage.getSystemConfig();
    if (config && config.config) {
      const slackConfig = config.config.find(item => item.key === 'slackWebhookUrl');
      if (slackConfig) {
        const data = {};
        data.value = slackConfig.value;
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.notification, data));
      } else {
        return res.status(404).end();
      }
    } else {
      const error = {};
      error.status = '500';
      error.title = 'Internal Server Error';
      const errors = [error];
      const errorResponse = {};
      errorResponse.errors = errors;
      res.status(500).json(errorResponse);
    }
  } catch (err) {
    const error = {};
    error.status = '500';
    error.title = err ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.updateSystemConfig = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password, role } = helpers.extractRequestData(req.body);
    const storage = getStorageConnection();
    if (userId && email && password && role) {
      const user = await storage.getUserById(userId);
      if (user && user.id && user.email === email) {
        const updatedUser = {};
        updatedUser.name = user.name;
        updatedUser.email = email;
        updatedUser.password = password;
        updatedUser.role = role;
        const result = await storage.updateUser(updatedUser);
        if (result && result.id && result.email === email) {
          res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.user, result));
        } else {
          const error = {};
          error.status = '500';
          error.title = result.message || 'Internal Server Error';
          const errors = [error];
          const errorResponse = {};
          errorResponse.errors = errors;
          res.status(500).json(errorResponse);
        }
      } else {
        const error = {};
        error.status = '404';
        error.title = user && user.message ? user.message : 'Not Found';
        const errors = [error];
        const errorResponse = {};
        errorResponse.errors = errors;
        res.status(404).json(errorResponse);
      }
    } else {
      const error = {};
      error.status = '400';
      error.title = 'Bad Request';
      const errors = [error];
      const errorResponse = {};
      errorResponse.errors = errors;
      res.status(400).json(errorResponse);
    }
  } catch (err) {
    const error = {};
    error.status = '500';
    error.title = err ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userToDeleteId = req.body.data.id;
    const storage = getStorageConnection();
    if (userId && userToDeleteId) {
      const user = await storage.getUserById(userId);
      if (user && user.id && user.id === userId) {
        const deletedUser = await storage.deleteUser(userToDeleteId);
        if (deletedUser) {
          res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.user, deletedUser));
        } else {
          const error = {};
          error.status = '500';
          error.title = deletedUser.message || 'Internal Server Error';
          const errors = [error];
          const errorResponse = {};
          errorResponse.errors = errors;
          res.status(500).json(errorResponse);
        }
      } else {
        const error = {};
        error.status = '404';
        error.title = user && user.message ? user.message : 'Not Found';
        const errors = [error];
        const errorResponse = {};
        errorResponse.errors = errors;
        res.status(404).json(errorResponse);
      }
    } else {
      const error = {};
      error.status = '400';
      error.title = 'Bad Request';
      const errors = [error];
      const errorResponse = {};
      errorResponse.errors = errors;
      res.status(400).json(errorResponse);
    }
  } catch (err) {
    const error = {};
    error.status = '500';
    error.title = err ? err.message : 'Internal Server Error';
    const errorResponse = {};
    errorResponse.errors = [error];
    res.status(500).json(errorResponse);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const users = await storage.getUsers();
    const data = {};
    data.users = users.users;
    const responseData = data;
    res.json(Jsonapi.serializer.serialize(Jsonapi.user, responseData));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Internal Server Error';
    res.status(500).json(error);
  }
};
