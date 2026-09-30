'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');

// These utilities are shared by the server's generated CommonJS bundles.
const jsonApi = globalThis.require_jsonapiUtil?.() || globalThis.Jsonapi || {};
const helpers = globalThis.require_helpers?.() || globalThis.helpers || {};
const storageModule = globalThis.require_storageConnection?.() || {};

const getStorageConnection = storageModule.getStorageConnection
  || globalThis.getStorageConnection
  || (() => { throw new Error('Storage connection is not initialized'); });
const { Serializer, UserType } = jsonApi;

const BAD_REQUEST = 'Bad Request';
const INTERNAL_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';
const INTERNAL_ERROR_MESSAGE = 'An internal server error occurred';
const INVALID_REQUEST = 'invalid request';

function serialize(data) {
  return Serializer.serialize(UserType, data);
}

function sendErrors(response, status, errors) {
  response.status(status).send({ errors });
}

function sendInternalError(response, error) {
  sendErrors(response, 500, [{
    error: INTERNAL_ERROR,
    message: error ? error.message : UNEXPECTED_ERROR,
  }]);
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
      sendErrors(response, 409, [{
        error: 'Conflict',
        message: 'Main account already created',
      }]);
      return;
    }

    const result = await storage.createUser({ name, email, password, role });
    if (!result || !result.item) {
      sendErrors(response, 500, [{
        error: INTERNAL_ERROR,
        message: result && result.error ? result.error : INTERNAL_ERROR_MESSAGE,
      }]);
      return;
    }

    if (!helpers.getJWTSecret()) {
      const secretWasAdded = await helpers.addJWTSecret();
      if (!secretWasAdded) {
        sendErrors(response, 500, [{
          error: INTERNAL_ERROR,
          message: INTERNAL_ERROR_MESSAGE,
        }]);
        return;
      }
    }

    const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
    response.status(201).send(serialize({ name, email, token }));
  } catch (error) {
    console.error(error);
    sendErrors(response, 500, [{
      error: INTERNAL_ERROR,
      message: error && error.message ? error.message : UNEXPECTED_ERROR,
    }]);
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const secretWasAdded = await helpers.addJWTSecret();
      if (!secretWasAdded) {
        sendErrors(response, 500, [{
          error: INTERNAL_ERROR,
          message: INTERNAL_ERROR_MESSAGE,
        }]);
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
      response.status(200).send(serialize({ token }));
      return;
    }

    sendErrors(response, 401, [{
      error: 'Unauthorized',
      message: result && result.error
        ? result.error
        : 'Login failed, please check your credentials',
    }]);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    const { email } = request;
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, [{ error: BAD_REQUEST, message: INVALID_REQUEST }]);
      return;
    }

    const result = await storage.getUserByEmail(email);
    if (result && result.item && result.item.email) {
      response.status(200).send(serialize(result.item));
      return;
    }

    sendErrors(response, 500, [{
      error: INTERNAL_ERROR,
      message: result && result.error ? result.error : INTERNAL_ERROR_MESSAGE,
    }]);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateUserProfile = async (request, response) => {
  try {
    const { email } = request;
    const { name } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, [{ error: BAD_REQUEST, message: INVALID_REQUEST }]);
      return;
    }

    const result = await storage.updateUserByEmail(email, { name });
    if (result && result.item && result.item.email === email) {
      response.status(200).send(serialize({ name, email }));
      return;
    }

    sendErrors(response, 500, [{
      error: INTERNAL_ERROR,
      message: result && result.error ? result.error : INTERNAL_ERROR_MESSAGE,
    }]);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateUserPassword = async (request, response) => {
  try {
    const { email } = request;
    const { currentPassword, newPassword } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, [{ error: BAD_REQUEST, message: INVALID_REQUEST }]);
      return;
    }

    const result = await storage.updatePassword(email, currentPassword, newPassword);
    if (result && result.item && result.item.email === email) {
      response.status(200).send(serialize({ email }));
      return;
    }

    sendErrors(response, 500, [{
      error: INTERNAL_ERROR,
      message: result && result.message ? result.message : INTERNAL_ERROR_MESSAGE,
    }]);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    const { email } = request;
    const storage = getStorageConnection();

    if (!email) {
      sendErrors(response, 400, [{ error: BAD_REQUEST, message: INVALID_REQUEST }]);
      return;
    }

    const result = await storage.getAllUsers();
    if (!result || !result.items) {
      throw new Error(UNEXPECTED_ERROR);
    }
    response.status(200).send(serialize(result.items));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAdminName = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getAllUsers();

    if (!result || !result.items) {
      sendErrors(response, 400, [{ error: BAD_REQUEST, message: INVALID_REQUEST }]);
      return;
    }

    const admin = result.items.find((user) => user.role === 'admin');
    if (admin) {
      return response.status(200).send(serialize({ name: admin.name }));
    }
    return response.status(200).send();
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const { email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!adminEmail || !email || !password || !role) {
      sendErrors(response, 400, [{ error: BAD_REQUEST, message: INVALID_REQUEST }]);
      return;
    }

    const adminResult = await storage.getUserByEmail(adminEmail);
    if (!adminResult || !adminResult.item || adminResult.item.role !== 'admin') {
      sendErrors(response, 403, [{
        error: 'Forbidden',
        message: adminResult && adminResult.error ? adminResult.error : 'Not allowed',
      }]);
      return;
    }

    const result = await storage.createUser({ name: 'User', email, password, role });
    if (result && result.item && result.item.email === email) {
      response.status(200).send(serialize(result));
      return;
    }

    sendErrors(response, 500, [{
      error: INTERNAL_ERROR,
      message: result.error || INTERNAL_ERROR_MESSAGE,
    }]);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.removeUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const { userId } = request.params;
    const storage = getStorageConnection();

    if (!adminEmail || !userId) {
      sendErrors(response, 400, [{ error: BAD_REQUEST, message: INVALID_REQUEST }]);
      return;
    }

    const adminResult = await storage.getUserByEmail(adminEmail);
    if (!adminResult || !adminResult.item || adminResult.item.role !== 'admin') {
      sendErrors(response, 403, [{
        error: 'Forbidden',
        message: adminResult && adminResult.error ? adminResult.error : 'Not allowed',
      }]);
      return;
    }

    const result = await storage.deleteUser(userId);
    if (result) {
      response.status(200).send(serialize(result));
      return;
    }

    sendErrors(response, 500, [{
      error: INTERNAL_ERROR,
      message: result.error || INTERNAL_ERROR_MESSAGE,
    }]);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getTotalUsers = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getUserCount();
    response.send(serialize({ count: result.count }));
  } catch (error) {
    console.error(error);
    response.status(500).send({
      error: 'An error occurred while fetching user count.',
    });
  }
};
