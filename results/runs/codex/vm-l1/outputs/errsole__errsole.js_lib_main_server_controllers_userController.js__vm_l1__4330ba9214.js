'use strict';

const path = require('path');
const Jsonapi = require('./utils/jsonapiUtil');
const jwt = require('jsonwebtoken');
const helpers = require('./utils/helpers');
const { getStorageConnection } = require('./storageConnection');

const INTERNAL_SERVER_ERROR = 'Internal Server Error';
const INTERNAL_ERROR_MESSAGE = 'An internal server error occurred';
const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred';
const INVALID_REQUEST_MESSAGE = 'invalid request';

function sendError(response, statusCode, error, message) {
  response.status(statusCode).send({ errors: [{ error, message }] });
}

function serializeUser(data) {
  return Jsonapi.Serializer.serialize(Jsonapi.UserType, data);
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
      sendError(response, 409, 'Conflict', 'Main account already created');
      return;
    }

    const createResult = await storage.createUser({ name, email, password, role });
    if (!createResult || !createResult.item) {
      const message = createResult && createResult.error
        ? createResult.error
        : INTERNAL_ERROR_MESSAGE;
      sendError(response, 500, INTERNAL_SERVER_ERROR, message);
      return;
    }

    if (!helpers.getJWTSecret()) {
      const secretAdded = await helpers.addJWTSecret();
      if (!secretAdded) {
        sendError(response, 500, INTERNAL_SERVER_ERROR, INTERNAL_ERROR_MESSAGE);
        return;
      }
    }

    const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
    response.status(201).send(serializeUser({ name, email, token }));
  } catch (error) {
    console.error(error);
    sendError(
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
        sendError(response, 500, INTERNAL_SERVER_ERROR, INTERNAL_ERROR_MESSAGE);
        return;
      }
    }

    if (!email || !password) {
      response.status(400).send({
        error: 'Bad Request',
        message: 'Email or password is missing',
      });
      return;
    }

    const verification = await storage.verifyUser(email, password);
    if (verification && verification.item && verification.item.email === email) {
      const token = jwt.sign(
        { email },
        helpers.getJWTSecret(),
        { expiresIn: '1w' },
      );
      response.status(200).send(serializeUser({ token }));
      return;
    }

    const message = verification && verification.error
      ? verification.error
      : 'Login failed, please check your credentials';
    sendError(response, 401, 'Unauthorized', message);
  } catch (error) {
    sendError(
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
      sendError(response, 400, 'Bad Request', INVALID_REQUEST_MESSAGE);
      return;
    }

    const userResult = await storage.getUserByEmail(email);
    if (userResult && userResult.item && userResult.item.email) {
      response.status(200).send(serializeUser(userResult.item));
      return;
    }

    const message = userResult && userResult.error
      ? userResult.error
      : INTERNAL_ERROR_MESSAGE;
    sendError(response, 500, INTERNAL_SERVER_ERROR, message);
  } catch (error) {
    sendError(
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
      sendError(response, 400, 'Bad Request', INVALID_REQUEST_MESSAGE);
      return;
    }

    const updateResult = await storage.updateUserByEmail(email, { name });
    if (updateResult && updateResult.item && updateResult.item.email === email) {
      response.status(200).send(serializeUser({ name, email }));
      return;
    }

    const message = updateResult && updateResult.error
      ? updateResult.error
      : INTERNAL_ERROR_MESSAGE;
    sendError(response, 500, INTERNAL_SERVER_ERROR, message);
  } catch (error) {
    sendError(
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
      sendError(response, 400, 'Bad Request', INVALID_REQUEST_MESSAGE);
      return;
    }

    const updateResult = await storage.updatePassword(
      email,
      currentPassword,
      newPassword,
    );
    if (updateResult && updateResult.item && updateResult.item.email === email) {
      response.status(200).send(serializeUser({ email }));
      return;
    }

    const message = updateResult && updateResult.message
      ? updateResult.message
      : INTERNAL_ERROR_MESSAGE;
    sendError(response, 500, INTERNAL_SERVER_ERROR, message);
  } catch (error) {
    sendError(
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
      sendError(response, 400, 'Bad Request', INVALID_REQUEST_MESSAGE);
      return;
    }

    const usersResult = await storage.getAllUsers();
    if (!usersResult || !usersResult.items) {
      throw new Error(UNEXPECTED_ERROR_MESSAGE);
    }

    response.status(200).send(serializeUser(usersResult.items));
  } catch (error) {
    sendError(
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
    const usersResult = await storage.getAllUsers();

    if (!usersResult || !usersResult.items) {
      sendError(response, 400, 'Bad Request', INVALID_REQUEST_MESSAGE);
      return;
    }

    const admin = usersResult.items.find((user) => user.role === 'admin');
    if (admin) {
      return response.status(200).send(serializeUser({ name: admin.name }));
    }
    return response.status(200).send();
  } catch (error) {
    sendError(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.addUser = async (request, response) => {
  try {
    const requestingUserEmail = request.email;
    const { email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!requestingUserEmail || !email || !password || !role) {
      sendError(response, 400, 'Bad Request', INVALID_REQUEST_MESSAGE);
      return;
    }

    const requestingUser = await storage.getUserByEmail(requestingUserEmail);
    if (!requestingUser || !requestingUser.item || requestingUser.item.role !== 'admin') {
      const message = requestingUser && requestingUser.error
        ? requestingUser.error
        : 'Not allowed';
      sendError(response, 403, 'Forbidden', message);
      return;
    }

    const createResult = await storage.createUser({
      name: 'User',
      email,
      password,
      role,
    });
    if (createResult && createResult.item && createResult.item.email === email) {
      response.status(200).send(serializeUser(createResult));
      return;
    }

    sendError(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      createResult.error || INTERNAL_ERROR_MESSAGE,
    );
  } catch (error) {
    sendError(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    );
  }
};

exports.removeUser = async (request, response) => {
  try {
    const requestingUserEmail = request.email;
    const userId = request.params.userId;
    const storage = getStorageConnection();

    if (!requestingUserEmail || !userId) {
      sendError(response, 400, 'Bad Request', INVALID_REQUEST_MESSAGE);
      return;
    }

    const requestingUser = await storage.getUserByEmail(requestingUserEmail);
    if (!requestingUser || !requestingUser.item || requestingUser.item.role !== 'admin') {
      const message = requestingUser && requestingUser.error
        ? requestingUser.error
        : 'Not allowed';
      sendError(response, 403, 'Forbidden', message);
      return;
    }

    const deleteResult = await storage.deleteUser(userId);
    if (deleteResult) {
      response.status(200).send(serializeUser(deleteResult));
      return;
    }

    sendError(
      response,
      500,
      INTERNAL_SERVER_ERROR,
      deleteResult.error || INTERNAL_ERROR_MESSAGE,
    );
  } catch (error) {
    sendError(
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
    const userCount = await storage.getUserCount();
    response.send(serializeUser({ count: userCount.count }));
  } catch (error) {
    console.error(error);
    response.status(500).send({
      error: 'An error occurred while fetching user count.',
    });
  }
};
