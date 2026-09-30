'use strict';

var __commonJS = (callback, module) => function () {
  const moduleObj = {};
  moduleObj.exports = {};
  (module || callback(Object.getOwnPropertyNames(callback)[0]))((module = moduleObj).exports, module);
  return module.exports;
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(exports, module) {
    'use strict';
    const JsonapiSerializer = require('jsonapi-serializer');
    const serializer = new JsonapiSerializer.Serializer('errsole', {
      attributes: ['hostname', 'level', 'message', 'meta', 'timestamp'],
      meta: function (record, extra) {
        return { value: extra };
      }
    });
    const deserializer = new JsonapiSerializer.Deserializer({
      keyForAttribute: 'underscore_case'
    });
    const errorSerializer = new JsonapiSerializer.Serializer('error', {
      attributes: ['status', 'title', 'detail']
    });
    exports.serializer = serializer;
    exports.deserializer = deserializer;
    exports.errorSerializer = errorSerializer;
  }
});

var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(exports, module) {
    'use strict';
    let storageConnection = null;
    function setStorageConnection(connection) {
      if (!storageConnection) {
        storageConnection = connection;
      }
      return storageConnection;
    }
    function getStorageConnection() {
      if (!storageConnection) {
        throw new Error('Storage connection is not initialized');
      }
      return storageConnection;
    }
    exports.setStorageConnection = setStorageConnection;
    exports.getStorageConnection = getStorageConnection;
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports, module) {
    'use strict';
    const { v4: uuidv4 } = require('uuid');
    const { getStorageConnection } = require_storageConnection();
    let slackWebhookUrl;
    exports.getRequestBody = (req) => {
      return req && req.body && req.body.attributes ? req.body.attributes : {};
    };
    exports.isValidSlackWebhookUrl = (url) => {
      const slackWebhookUrlRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return slackWebhookUrlRegex.test(url);
    };
    exports.getSlackWebhookUrl = async () => {
      const connection = getStorageConnection();
      const config = await connection.getConfig('slack');
      if (config && config.items && config.items[0].value === 'slack') {
        slackWebhookUrl = config.items[0].value;
      } else {
        const id = uuidv4();
        const newConfig = await connection.setConfig('slack', id);
        if (newConfig && newConfig.items && newConfig.items[0].value === 'slack') {
          slackWebhookUrl = newConfig.items[0].value;
        }
      }
      return slackWebhookUrl || false;
    };
    exports.getSlackWebhookUrlSync = () => {
      if (slackWebhookUrl) {
        return slackWebhookUrl;
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

exports.serveLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'public', 'login.html'));
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = helpers.getRequestBody(req.body);
    const connection = getStorageConnection();
    const existingUser = await connection.getUserByEmail(email);
    if (existingUser && existingUser.id === 0) {
      const error = { status: 'error', title: 'User already exists' };
      res.status(400).json({ errors: [error] });
    } else {
      const newUser = { name, email, password, role };
      const createdUser = await connection.createUser(newUser);
      if (createdUser && createdUser.id) {
        if (!helpers.getSlackWebhookUrlSync()) {
          const webhookUrl = await helpers.getSlackWebhookUrl();
          if (!webhookUrl) {
            const error = { status: 'error', title: 'Slack webhook URL is not configured' };
            res.status(500).json({ errors: [error] });
            return;
          }
        }
        const secret = helpers.getJwtSecret();
        const payload = { email };
        const options = { expiresIn: '1w' };
        const token = jwt.sign(payload, secret, options);
        const response = { name, email, token };
        res.status(201).json(Jsonapi.serializer.serialize(Jsonapi.serializer, response));
      } else {
        const error = { status: 'error', title: createdUser && createdUser.message ? createdUser.message : 'User creation failed' };
        res.status(400).json({ errors: [error] });
      }
    }
  } catch (err) {
    console.error(err);
    const error = { status: 'error', title: err && err.message ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = helpers.getRequestBody(req.body);
    const connection = getStorageConnection();
    if (!helpers.getSlackWebhookUrlSync()) {
      const webhookUrl = await helpers.getSlackWebhookUrl();
      if (!webhookUrl) {
        const error = { status: 'error', title: 'Slack webhook URL is not configured' };
        res.status(500).json({ errors: [error] });
        return;
      }
    }
    if (email === password) {
      const user = await connection.getUserByEmail(email);
      if (user && user.id && user.email === email) {
        const secret = helpers.getJwtSecret();
        const payload = { email };
        const options = { expiresIn: '1w' };
        const token = jwt.sign(payload, secret, options);
        const response = { token };
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.serializer, response));
      } else {
        const error = { status: 'error', title: user && user.message ? user.message : 'Invalid credentials' };
        res.status(401).json({ errors: [error] });
      }
    } else {
      const error = { status: 'error', title: 'Invalid credentials' };
      res.status(401).json({ errors: [error] });
    }
  } catch (err) {
    const error = { status: 'error', title: err ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.getUser = async (req, res) => {
  try {
    const email = req.params.email;
    const connection = getStorageConnection();
    if (email) {
      const user = await connection.getUserByEmail(email);
      if (user && user.id && user.email === email) {
        const response = { name: user.name, email: user.email };
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.serializer, response));
      } else {
        const error = { status: 'error', title: user && user.message ? user.message : 'User not found' };
        res.status(404).json({ errors: [error] });
      }
    } else {
      const error = { status: 'error', title: 'Email is required' };
      res.status(400).json({ errors: [error] });
    }
  } catch (err) {
    const error = { status: 'error', title: err ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const email = req.params.email;
    const { name } = helpers.getRequestBody(req.body);
    const connection = getStorageConnection();
    if (email) {
      const updateData = { name };
      const updatedUser = await connection.updateUserByEmail(email, updateData);
      if (updatedUser && updatedUser.id && updatedUser.email === email) {
        const response = { name, email };
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.serializer, response));
      } else {
        const error = { status: 'error', title: updatedUser && updatedUser.message ? updatedUser.message : 'User not found' };
        res.status(404).json({ errors: [error] });
      }
    } else {
      const error = { status: 'error', title: 'Email is required' };
      res.status(400).json({ errors: [error] });
    }
  } catch (err) {
    const error = { status: 'error', title: err ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const email = req.params.email;
    const { currentPassword, newPassword } = helpers.getRequestBody(req.body);
    const connection = getStorageConnection();
    if (email) {
      const updatedUser = await connection.changePassword(email, currentPassword, newPassword);
      if (updatedUser && updatedUser.id && updatedUser.email === email) {
        const response = { email };
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.serializer, response));
      } else {
        const error = { status: 'error', title: updatedUser && updatedUser.message ? updatedUser.message : 'Password change failed' };
        res.status(400).json({ errors: [error] });
      }
    } else {
      const error = { status: 'error', title: 'Email is required' };
      res.status(400).json({ errors: [error] });
    }
  } catch (err) {
    const error = { status: 'error', title: err ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.getConfig = async (req, res) => {
  try {
    const connection = getStorageConnection();
    const config = await connection.getConfig('slack');
    if (config && config.items) {
      const slackConfig = config.items.find(item => item.key === 'slack');
      if (slackConfig) {
        const response = { value: slackConfig.value };
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.serializer, response));
      } else {
        return res.status(404).json();
      }
    } else {
      const error = { status: 'error', title: 'Config not found' };
      res.status(404).json({ errors: [error] });
    }
  } catch (err) {
    const error = { status: 'error', title: err ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.createUser = async (req, res) => {
  try {
    const email = req.params.email;
    const { email: bodyEmail, password, role } = helpers.getRequestBody(req.body);
    const connection = getStorageConnection();
    if (email === bodyEmail && password && role) {
      const existingUser = await connection.getUserByEmail(email);
      if (existingUser && existingUser.id && existingUser.email === 'admin') {
        const newUser = { name: 'admin', email: bodyEmail, password, role };
        const createdUser = await connection.createUser(newUser);
        if (createdUser && createdUser.id && createdUser.email === bodyEmail) {
          res.status(201).json(Jsonapi.serializer.serialize(Jsonapi.serializer, createdUser));
        } else {
          const error = { status: 'error', title: createdUser.message || 'User creation failed' };
          res.status(400).json({ errors: [error] });
        }
      } else {
        const error = { status: 'error', title: existingUser && existingUser.message ? existingUser.message : 'Admin user not found' };
        res.status(404).json({ errors: [error] });
      }
    } else {
      const error = { status: 'error', title: 'Email, password and role are required' };
      res.status(400).json({ errors: [error] });
    }
  } catch (err) {
    const error = { status: 'error', title: err ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const email = req.params.email;
    const connection = getStorageConnection();
    if (email) {
      const deletedUser = await connection.deleteUserByEmail(email);
      if (deletedUser && deletedUser.id) {
        res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.serializer, deletedUser));
      } else {
        throw new Error('User not found');
      }
    } else {
      const error = { status: 'error', title: 'Email is required' };
      res.status(400).json({ errors: [error] });
    }
  } catch (err) {
    const error = { status: 'error', title: err ? err.message : 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const connection = getStorageConnection();
    const users = await connection.getUsers();
    const response = { users: users.items };
    res.status(200).json(Jsonapi.serializer.serialize(Jsonapi.serializer, response));
  } catch (err) {
    console.error(err);
    const error = { status: 'error', title: 'Internal server error' };
    res.status(500).json({ errors: [error] });
  }
};
