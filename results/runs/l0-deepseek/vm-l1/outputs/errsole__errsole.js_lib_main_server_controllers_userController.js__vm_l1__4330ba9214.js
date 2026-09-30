'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');

const require_jsonapiUtil = require('../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js');
const require_storageConnection = require('../work/errsole__errsole.js/lib/main/server/storageConnection.js');
const require_helpers = require('../work/errsole__errsole.js/lib/main/server/utils/helpers.js');

const Jsonapi = require_jsonapiUtil();
const helpers = require_helpers();
const { getStorageConnection } = require_storageConnection();

exports.serveIndexPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(req.body);
    const storage = getStorageConnection();
    const userCount = await storage.getUserCount();

    if (userCount && userCount.count !== 0) {
      const errors = [{ error: 'Conflict', message: 'Main account already created' }];
      res.status(409).send({ errors });
    } else {
      const result = await storage.createUser({ name, email, password, role });

      if (result && result.item) {
        if (!helpers.getJWTSecret()) {
          const secret = await helpers.addJWTSecret();
          if (!secret) {
            const errors = [{ error: 'Internal Server Error', message: 'An internal server error occurred' }];
            res.status(500).send({ errors });
            return;
          }
        }

        const jwtSecret = helpers.getJWTSecret();
        const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1w' });
        const user = { name, email, token };
        res.status(201).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{
          error: 'Internal Server Error',
          message: result && result.error ? result.error : 'An internal server error occurred'
        }];
        res.status(500).send({ errors });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = helpers.extractAttributes(req.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const secret = await helpers.addJWTSecret();
      if (!secret) {
        const errors = [{ error: 'Internal Server Error', message: 'An internal server error occurred' }];
        res.status(500).send({ errors });
        return;
      }
    }

    if (email && password) {
      const result = await storage.verifyUser(email, password);

      if (result && result.item && result.item.email === email) {
        const jwtSecret = helpers.getJWTSecret();
        const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1w' });
        const user = { token };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{
          error: 'Unauthorized',
          message: result && result.error ? result.error : 'Login failed, please check your credentials'
        }];
        res.status(401).send({ errors });
      }
    } else {
      res.status(400).send({ error: 'Bad Request', message: 'Email or password is missing' });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.getUserByEmail(email);

      if (result && result.item && result.item.email) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result.item));
      } else {
        const errors = [{
          error: 'Internal Server Error',
          message: result && result.error ? result.error : 'An internal server error occurred'
        }];
        res.status(500).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const { name } = helpers.extractAttributes(req.body);
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.updateUserByEmail(email, { name });

      if (result && result.item && result.item.email === email) {
        const user = { name, email };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{
          error: 'Internal Server Error',
          message: result && result.error ? result.error : 'An internal server error occurred'
        }];
        res.status(500).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const email = req.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(req.body);
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.updatePassword(email, currentPassword, newPassword);

      if (result && result.item && result.item.email === email) {
        const user = { email };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{
          error: 'Internal Server Error',
          message: result && result.error ? result.error : 'An internal server error occurred'
        }];
        res.status(500).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const email = req.email;
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.getAllUsers();

      if (result && result.items) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result.items));
      } else {
        throw new Error('An unexpected error occurred');
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.getAdminName = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getAllUsers();

    if (result && result.items) {
      const admin = result.items.find(user => user.role === 'admin');
      return admin
        ? res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { name: admin.name }))
        : res.status(200).send();
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.addUser = async (req, res) => {
  try {
    const email = req.email;
    const { email: newEmail, password, role } = helpers.extractAttributes(req.body);
    const storage = getStorageConnection();

    if (email && newEmail && password && role) {
      const admin = await storage.getUserByEmail(email);

      if (admin && admin.item && admin.item.role === 'admin') {
        const result = await storage.createUser({ name: 'User', email: newEmail, password, role });

        if (result && result.item && result.item.email === newEmail) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result));
        } else {
          const errors = [{
            error: 'Internal Server Error',
            message: result.error || 'An internal server error occurred'
          }];
          res.status(500).send({ errors });
        }
      } else {
        const errors = [{
          error: 'Forbidden',
          message: admin && admin.error ? admin.error : 'Not allowed'
        }];
        res.status(403).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const email = req.email;
    const userId = req.params.userId;
    const storage = getStorageConnection();

    if (email && userId) {
      const admin = await storage.getUserByEmail(email);

      if (admin && admin.item && admin.item.role === 'admin') {
        const result = await storage.deleteUser(userId);

        if (result) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result));
        } else {
          const errors = [{
            error: 'Internal Server Error',
            message: result.error || 'An internal server error occurred'
          }];
          res.status(500).send({ errors });
        }
      } else {
        const errors = [{
          error: 'Forbidden',
          message: admin && admin.error ? admin.error : 'Not allowed'
        }];
        res.status(403).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors });
  }
};

exports.getTotalUsers = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getUserCount();
    const data = { count: result.count };
    res.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, data));
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while fetching user count.' });
  }
};
