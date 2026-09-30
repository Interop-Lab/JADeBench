'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');
const Jsonapi = require('../utils/jsonapiUtil');
const helpers = require('../utils/helpers');
const { getStorageConnection } = require('../storageConnection');

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const CONFLICT = 409;
const INTERNAL_SERVER_ERROR = 500;
const OK = 200;
const CREATED = 201;

const USER_TYPE = Jsonapi.UserType;
const serializeUser = (value) => Jsonapi.Serializer.serialize(USER_TYPE, value);

exports.serveIndexPage = (_request, response) => {
  response.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (request, response) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const userCount = await storage.getUserCount();

    if (userCount && userCount.count !== 0) {
      response.status(CONFLICT).send({
        errors: [{ error: 'Conflict', message: 'Main account already created' }],
      });
      return;
    }

    const result = await storage.createUser({ name, email, password, role });
    if (!result || !result.item) {
      response.status(INTERNAL_SERVER_ERROR).send({
        errors: [{
          error: 'Internal Server Error',
          message: result && result.error
            ? result.error
            : 'An internal server error occurred',
        }],
      });
      return;
    }

    if (!helpers.getJWTSecret()) {
      const secretWasAdded = await helpers.addJWTSecret();
      if (!secretWasAdded) {
        response.status(INTERNAL_SERVER_ERROR).send({
          errors: [{
            error: 'Internal Server Error',
            message: 'An internal server error occurred',
          }],
        });
        return;
      }
    }

    const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
    response.status(CREATED).send(serializeUser({ name, email, token }));
  } catch (error) {
    console.error(error);
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error && error.message ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const secretWasAdded = await helpers.addJWTSecret();
      if (!secretWasAdded) {
        response.status(INTERNAL_SERVER_ERROR).send({
          errors: [{
            error: 'Internal Server Error',
            message: 'An internal server error occurred',
          }],
        });
        return;
      }
    }

    if (!email || !password) {
      response.status(BAD_REQUEST).send({
        error: 'Bad Request',
        message: 'Email or password is missing',
      });
      return;
    }

    const result = await storage.verifyUser(email, password);
    if (result && result.item && result.item.email === email) {
      const token = jwt.sign(
        { email },
        helpers.getJWTSecret(),
        { expiresIn: '1w' },
      );
      response.status(OK).send(serializeUser({ token }));
      return;
    }

    response.status(UNAUTHORIZED).send({
      errors: [{
        error: 'Unauthorized',
        message: result && result.error
          ? result.error
          : 'Login failed, please check your credentials',
      }],
    });
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (!email) {
      response.status(BAD_REQUEST).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const result = await storage.getUserByEmail(email);
    if (result && result.item && result.item.email) {
      response.status(OK).send(serializeUser(result.item));
      return;
    }

    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: result && result.error
          ? result.error
          : 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.updateUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const { name } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      response.status(BAD_REQUEST).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const result = await storage.updateUserByEmail(email, { name });
    if (result && result.item && result.item.email === email) {
      response.status(OK).send(serializeUser({ name, email }));
      return;
    }

    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: result && result.error
          ? result.error
          : 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.updateUserPassword = async (request, response) => {
  try {
    const email = request.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      response.status(BAD_REQUEST).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const result = await storage.updatePassword(email, currentPassword, newPassword);
    if (result && result.item && result.item.email === email) {
      response.status(OK).send(serializeUser({ email }));
      return;
    }

    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: result && result.message
          ? result.message
          : 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (!email) {
      response.status(BAD_REQUEST).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const result = await storage.getAllUsers();
    if (!result || !result.items) {
      throw new Error('An unexpected error occurred');
    }

    response.status(OK).send(serializeUser(result.items));
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.getAdminName = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getAllUsers();

    if (!result || !result.items) {
      response.status(BAD_REQUEST).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const admin = result.items.find((user) => user.role === 'admin');
    if (admin) {
      return response.status(OK).send(serializeUser({ name: admin.name }));
    }
    return response.status(OK).send();
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.addUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const { email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!adminEmail || !email || !password || !role) {
      response.status(BAD_REQUEST).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const adminResult = await storage.getUserByEmail(adminEmail);
    if (!adminResult || !adminResult.item || adminResult.item.role !== 'admin') {
      response.status(FORBIDDEN).send({
        errors: [{
          error: 'Forbidden',
          message: adminResult && adminResult.error ? adminResult.error : 'Not allowed',
        }],
      });
      return;
    }

    const result = await storage.createUser({
      name: 'User',
      email,
      password,
      role,
    });
    if (result && result.item && result.item.email === email) {
      response.status(OK).send(serializeUser(result));
      return;
    }

    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: result.error || 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.removeUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const userId = request.params.userId;
    const storage = getStorageConnection();

    if (!adminEmail || !userId) {
      response.status(BAD_REQUEST).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const adminResult = await storage.getUserByEmail(adminEmail);
    if (!adminResult || !adminResult.item || adminResult.item.role !== 'admin') {
      response.status(FORBIDDEN).send({
        errors: [{
          error: 'Forbidden',
          message: adminResult && adminResult.error ? adminResult.error : 'Not allowed',
        }],
      });
      return;
    }

    const result = await storage.deleteUser(userId);
    if (result) {
      response.status(OK).send(serializeUser(result));
      return;
    }

    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: result.error || 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(INTERNAL_SERVER_ERROR).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.getTotalUsers = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getUserCount();
    response.send(serializeUser({ count: result.count }));
  } catch (error) {
    console.error(error);
    response.status(INTERNAL_SERVER_ERROR).send({
      error: 'An error occurred while fetching user count.',
    });
  }
};
