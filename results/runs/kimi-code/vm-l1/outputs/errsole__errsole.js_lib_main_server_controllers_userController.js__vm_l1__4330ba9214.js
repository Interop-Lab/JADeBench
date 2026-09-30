'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');
const Jsonapi = require('../utils/jsonapiUtil');
const { getStorageConnection } = require('../storageConnection');
const helpers = require('../utils/helpers');

const BAD_REQUEST = 'Bad Request';
const INTERNAL_SERVER_ERROR = 'Internal Server Error';
const INVALID_REQUEST = 'invalid request';
const INTERNAL_ERROR_MESSAGE = 'An internal server error occurred';
const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred';

function serializeUser(data) {
  return Jsonapi.Serializer.serialize(Jsonapi.UserType, data);
}

function sendErrors(response, status, error, message) {
  return response.status(status).send({ errors: [{ error, message }] });
}

exports.serveIndexPage = (request, response) => {
  response.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (request, response) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const userCount = await storage.getUserCount();

    if (userCount && userCount.count !== 0) {
      response.status(409).send({
        errors: [{ error: 'Conflict', message: 'Main account already created' }],
      });
      return;
    }

    const result = await storage.createUser({ name, email, password, role });
    if (!result || !result.item) {
      sendErrors(
        response,
        500,
        INTERNAL_SERVER_ERROR,
        result && result.error ? result.error : INTERNAL_ERROR_MESSAGE,
      );
      return;
    }

    if (!helpers.getJWTSecret()) {
      const secretAdded = await helpers.addJWTSecret();
      if (!secretAdded) {
        sendErrors(response, 500, INTERNAL_SERVER_ERROR, INTERNAL_ERROR_MESSAGE);
        return;
      }
    }

    const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
    response.status(201).send(serializeUser({ name, email, token }));
  } catch (error) {
    console.error(error);
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error && error.message ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const secretAdded = await helpers.addJWTSecret();
      if (!secretAdded) {
        sendErrors(response, 500, INTERNAL_SERVER_ERROR, INTERNAL_ERROR_MESSAGE);
        return;
      }
    }

    if (!email || !password) {
      response.status(400).send({
        error: BAD_REQUEST,
        message: 'Email or password is missing',
      });
      return;
    }

    const result = await storage.verifyUser(email, password);
    if (result && result.item && result.item.email === email) {
      const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
      response.status(200).send(serializeUser({ token }));
      return;
    }

    sendErrors(
      response,
      401,
      'Unauthorized',
      result && result.error
        ? result.error
        : 'Login failed, please check your credentials',
    );
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, BAD_REQUEST, INVALID_REQUEST);
      return;
    }

    const result = await storage.getUserByEmail(email);
    if (result && result.item && result.item.email) {
      response.status(200).send(serializeUser(result.item));
      return;
    }

    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      result && result.error ? result.error : INTERNAL_ERROR_MESSAGE,
    );
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.updateUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const { name } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, BAD_REQUEST, INVALID_REQUEST);
      return;
    }

    const result = await storage.updateUserByEmail(email, { name });
    if (result && result.item && result.item.email === email) {
      response.status(200).send(serializeUser({ name, email }));
      return;
    }

    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      result && result.error ? result.error : INTERNAL_ERROR_MESSAGE,
    );
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.updateUserPassword = async (request, response) => {
  try {
    const email = request.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, BAD_REQUEST, INVALID_REQUEST);
      return;
    }

    const result = await storage.updatePassword(email, currentPassword, newPassword);
    if (result && result.item && result.item.email === email) {
      response.status(200).send(serializeUser({ email }));
      return;
    }

    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      result && result.message ? result.message : INTERNAL_ERROR_MESSAGE,
    );
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, BAD_REQUEST, INVALID_REQUEST);
      return;
    }

    const result = await storage.getAllUsers();
    if (!result || !result.items) {
      throw new Error(UNEXPECTED_ERROR_MESSAGE);
    }

    response.status(200).send(serializeUser(result.items));
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.getAdminName = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getAllUsers();

    if (!result || !result.items) {
      sendErrors(response, 400, BAD_REQUEST, INVALID_REQUEST);
      return;
    }

    const admin = result.items.find(user => user.role === 'admin');
    if (admin) {
      return response.status(200).send(serializeUser({ name: admin.name }));
    }
    return response.status(200).send();
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.addUser = async (request, response) => {
  try {
    const requestingEmail = request.email;
    const { email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!requestingEmail || !email || !password || !role) {
      sendErrors(response, 400, BAD_REQUEST, INVALID_REQUEST);
      return;
    }

    const requestingUser = await storage.getUserByEmail(requestingEmail);
    if (!requestingUser || !requestingUser.item || requestingUser.item.role !== 'admin') {
      sendErrors(
        response,
        403,
        'Forbidden',
        requestingUser && requestingUser.error ? requestingUser.error : 'Not allowed',
      );
      return;
    }

    const result = await storage.createUser({ name: 'User', email, password, role });
    if (result && result.item && result.item.email === email) {
      response.status(200).send(serializeUser(result));
      return;
    }

    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      result.error || INTERNAL_ERROR_MESSAGE,
    );
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.removeUser = async (request, response) => {
  try {
    const requestingEmail = request.email;
    const userId = request.params.userId;
    const storage = getStorageConnection();

    if (!requestingEmail || !userId) {
      sendErrors(response, 400, BAD_REQUEST, INVALID_REQUEST);
      return;
    }

    const requestingUser = await storage.getUserByEmail(requestingEmail);
    if (!requestingUser || !requestingUser.item || requestingUser.item.role !== 'admin') {
      sendErrors(
        response,
        403,
        'Forbidden',
        requestingUser && requestingUser.error ? requestingUser.error : 'Not allowed',
      );
      return;
    }

    const result = await storage.deleteUser(userId);
    if (result) {
      response.status(200).send(serializeUser(result));
      return;
    }

    sendErrors(response, 500, INTERNAL_SERVER_ERROR, result.error || INTERNAL_ERROR_MESSAGE);
  } catch (error) {
    sendErrors(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.getTotalUsers = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getUserCount();
    response.send(serializeUser({ count: result.count }));
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: 'An error occurred while fetching user count.' });
  }
};
