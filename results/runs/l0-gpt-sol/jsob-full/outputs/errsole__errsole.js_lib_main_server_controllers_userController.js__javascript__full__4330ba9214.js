'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');
const { getStorageConnection } = require('./storageConnection');
const helpers = require('./utils/helpers');

function sendError(res, status, message) {
  return res.status(status).json({ errors: [{ title: message }] });
}

function sendSuccess(res, status, data) {
  return res.status(status).json({ data });
}

function getTokenSecret() {
  return helpers.getJwtSecret();
}

function getToken(email) {
  return jwt.sign({ email }, getTokenSecret(), { expiresIn: '1w' });
}

exports.serveReactApp = (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'client', 'index.html'));
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = helpers.getUserDetails(req.body);
    const storage = getStorageConnection();
    const result = await storage.createUser({ name, email, password, role });

    if (!result || !result.success) {
      return sendError(res, 400, result && result.message ? result.message : 'Unable to create user');
    }

    if (!helpers.isUserConfigured()) {
      const configured = await helpers.configureUser();
      if (!configured) {
        return sendError(res, 400, 'Unable to configure user');
      }
    }

    const token = getToken(email);
    return sendSuccess(res, 201, { name, email, token });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error && error.message ? error.message : 'Internal server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = helpers.getUserDetails(req.body);
    const storage = getStorageConnection();
    const result = await storage.loginUser(email, password);

    if (
      result &&
      result.success &&
      result.user &&
      result.user.email === email
    ) {
      const token = getToken(email);
      return sendSuccess(res, 200, {
        name: result.user.name,
        email,
        token
      });
    }

    return sendError(
      res,
      401,
      result && result.message ? result.message : 'Invalid email or password'
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error && error.message ? error.message : 'Internal server error');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name } = helpers.getUserDetails(req.body);
    const email = req.body.email;
    const storage = getStorageConnection();
    const result = await storage.updateUser(email, { name });

    if (result && result.success && result.user && result.user.email === email) {
      return sendSuccess(res, 200, result.user);
    }

    return sendError(
      res,
      400,
      result && result.message ? result.message : 'Unable to update user'
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error && error.message ? error.message : 'Internal server error');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const email = req.body.email;
    const { currentPassword, newPassword } = helpers.getUserDetails(req.body);
    const storage = getStorageConnection();
    const result = await storage.changePassword(email, currentPassword, newPassword);

    if (result && result.success && result.user && result.user.email === email) {
      return sendSuccess(res, 200, { email });
    }

    return sendError(
      res,
      400,
      result && result.message ? result.message : 'Unable to change password'
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error && error.message ? error.message : 'Internal server error');
  }
};

exports.getAdminUser = async (_req, res) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getUsers();

    if (result && result.success) {
      const admin = result.users.find(user => user.role === 'admin');
      if (admin) {
        return sendSuccess(res, 200, { email: admin.email });
      }
      return res.status(204).send();
    }

    throw new Error('Unable to retrieve users');
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error && error.message ? error.message : 'Internal server error');
  }
};

exports.getUser = async (req, res) => {
  try {
    const email = req.body.email || req.query.email;
    const storage = getStorageConnection();
    const result = await storage.getUser(email);

    if (result && result.success && result.user) {
      return sendSuccess(res, 200, result.user);
    }

    return sendError(
      res,
      404,
      result && result.message ? result.message : 'User not found'
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error && error.message ? error.message : 'Internal server error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const email = req.body.email || req.query.email;
    const storage = getStorageConnection();
    const result = await storage.deleteUser(email);

    if (result && result.success) {
      return res.status(204).send();
    }
