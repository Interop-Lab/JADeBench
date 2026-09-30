'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');
const Jsonapi = require('./jsonapiUtil')();
const helpers = require('./helpers')();
const { getStorageConnection } = require('./storageConnection')();

exports.serveIndexPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const userCount = await storageConnection.getUserCount();
    if (userCount && userCount.count !== 0) {
      const errors = [{ error: 'Conflict', message: 'Main account already created' }];
      res.status(409).send({ errors });
    } else {
      const result = await storageConnection.createUser({ name, email, password, role });
      if (result && result.item) {
        if (!helpers.getJWTSecret()) {
          const jwtSecret = await helpers.addJWTSecret();
          if (!jwtSecret) {
            const errors = [{ error: 'Internal Server Error', message: 'An internal server error occurred' }];
            res.status(500).send({ errors });
            return;
          }
        }
        const secret = helpers.getJWTSecret();
        const token = jwt.sign({ email }, secret, { expiresIn: '1w' });
        const user = { name, email, token };
        res.status(201).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{ error: 'Internal Server Error', message: result && result.error ? result.error : 'An internal server error occurred' }];
        res.status(500).send({ errors });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ errors: [{ error: 'Internal Server Error', message: err && err.message ? err.message : 'An unexpected error occurred' }] });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (!helpers.getJWTSecret()) {
      const jwtSecret = await helpers.addJWTSecret();
      if (!jwtSecret) {
        const errors = [{ error: 'Internal Server Error', message: 'An internal server error occurred' }];
        res.status(500).send({ errors });
        return;
      }
    }
    if (email && password) {
      const result = await storageConnection.verifyUser(email, password);
      if (result && result.item && result.item.email === email) {
        const secret = helpers.getJWTSecret();
        const token = jwt.sign({ email }, secret, { expiresIn: '1w' });
        const user = { token };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{ error: 'Unauthorized', message: result && result.error ? result.error : 'Login failed, please check your credentials' }];
        res.status(401).send({ errors });
      }
    } else {
      res.status(400).send({ error: 'Bad Request', message: 'Email or password is missing' });
    }
  } catch (err) {
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const storageConnection = getStorageConnection();
    if (email) {
      const result = await storageConnection.getUserByEmail(email);
      if (result && result.item && result.item.email) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result.item));
      } else {
        const errors = [{ error: 'Internal Server Error', message: result && result.error ? result.error : 'An internal server error occurred' }];
        res.status(500).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const { name } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (email) {
      const result = await storageConnection.updateUserByEmail(email, { name });
      if (result && result.item && result.item.email === email) {
        const user = { name, email };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{ error: 'Internal Server Error', message: result && result.error ? result.error : 'An internal server error occurred' }];
        res.status(500).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const email = req.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (email) {
      const result = await storageConnection.updateUserPassword(email, currentPassword, newPassword);
      if (result && result.item && result.item.email === email) {
        const user = { email };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user));
      } else {
        const errors = [{ error: 'Internal Server Error', message: result && result.message ? result.message : 'An internal server error occurred' }];
        res.status(500).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const email = req.email;
    const storageConnection = getStorageConnection();
    if (email) {
      const result = await storageConnection.getAllUsers();
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
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.getAdminName = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getAllUsers();
    if (result && result.items) {
      const adminUser = result.items.find(user => user.role === 'admin');
      return adminUser
        ? res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { name: adminUser.name }))
        : res.status(200).send();
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.addUser = async (req, res) => {
  try {
    const email = req.email;
    const { email: newEmail, password, role } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (email && newEmail && password && role) {
      const adminUser = await storageConnection.getUserByEmail(email);
      if (adminUser && adminUser.item && adminUser.item.role === 'admin') {
        const result = await storageConnection.createUser({ name: 'admin', email: newEmail, password, role });
        if (result && result.item && result.item.email === newEmail) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result));
        } else {
          const errors = [{ error: 'Internal Server Error', message: result.error || 'An internal server error occurred' }];
          res.status(500).send({ errors });
        }
      } else {
        const errors = [{ error: 'Forbidden', message: adminUser && adminUser.error ? adminUser.error : 'Not allowed' }];
        res.status(403).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const email = req.email;
    const userId = req.params.userId;
    const storageConnection = getStorageConnection();
    if (email && userId) {
      const adminUser = await storageConnection.getUserByEmail(email);
      if (adminUser && adminUser.item && adminUser.item.role === 'admin') {
        const result = await storageConnection.deleteUser(userId);
        if (result) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result));
        } else {
          const errors = [{ error: 'Internal Server Error', message: result.error || 'An internal server error occurred' }];
          res.status(500).send({ errors });
        }
      } else {
        const errors = [{ error: 'Forbidden', message: adminUser && adminUser.error ? adminUser.error : 'Not allowed' }];
        res.status(403).send({ errors });
      }
    } else {
      const errors = [{ error: 'Bad Request', message: 'invalid request' }];
      res.status(400).send({ errors });
    }
  } catch (err) {
    const errors = [{ error: 'Internal Server Error', message: err ? err.message : 'An unexpected error occurred' }];
    res.status(500).send({ errors });
  }
};

exports.getTotalUsers = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const userCount = await storageConnection.getUserCount();
    const count = { count: userCount.count };
    res.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, count));
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while fetching user count.' });
  }
};
