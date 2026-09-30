'use strict';

const path = require('path');
const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const Jsonapi = {
  UserType: 'users',
  AppType: 'apps',
  LogType: 'logs',
  Serializer: new JsonApiSerializer({ jsonapiObject: false }),
};

Jsonapi.Serializer.register(Jsonapi.UserType, {});
Jsonapi.Serializer.register(Jsonapi.AppType, {});
Jsonapi.Serializer.register(Jsonapi.LogType, {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});

let storageConnection = null;

function initializeStorageConnection(connection) {
  if (!storageConnection) storageConnection = connection;
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

let jwtSecret;

function extractAttributes(body) {
  return body && body.data && body.data.attributes ? body.data.attributes : {};
}

function isSlackUrl(value) {
  const slackWebhook = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return slackWebhook.test(value);
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const storedSecret = await storage.getConfig('jwtSecret');

    if (storedSecret && storedSecret.item && storedSecret.item.key === 'jwtSecret') {
      jwtSecret = storedSecret.item.value;
    } else {
      const generatedSecret = uuid();
      const savedSecret = await storage.setConfig('jwtSecret', generatedSecret);
      if (savedSecret && savedSecret.item && savedSecret.item.key === 'jwtSecret') {
        jwtSecret = savedSecret.item.value;
      }
    }

    return jwtSecret || false;
  } catch (error) {
    console.error('An error occurred in addJWTSecret:', error);
    throw error;
  }
}

function getJWTSecret() {
  return jwtSecret || false;
}

function serializeUser(value) {
  return Jsonapi.Serializer.serialize(Jsonapi.UserType, value);
}

function sendError(response, status, error, message) {
  response.status(status).send({ errors: [{ error, message }] });
}

function sendInternalError(response, error, fallback = 'An unexpected error occurred') {
  sendError(response, 500, 'Internal Server Error', error ? error.message : fallback);
}

exports.serveIndexPage = (_request, response) => {
  response.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (request, response) => {
  try {
    const { name, email, password, role } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const userCount = await storage.getUserCount();

    if (userCount && userCount.count !== 0) {
      sendError(response, 409, 'Conflict', 'Main account already created');
      return;
    }

    const createdUser = await storage.createUser({ name, email, password, role });
    if (!createdUser || !createdUser.item) {
      sendError(
        response,
        500,
        'Internal Server Error',
        createdUser && createdUser.error
          ? createdUser.error
          : 'An internal server error occurred',
      );
      return;
    }

    if (!getJWTSecret() && !(await addJWTSecret())) {
      sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
      return;
    }

    const token = jwt.sign({ email }, getJWTSecret(), { expiresIn: '1w' });
    response.status(201).send(serializeUser({ name, email, token }));
  } catch (error) {
    console.error(error);
    sendInternalError(response, error);
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!getJWTSecret() && !(await addJWTSecret())) {
      sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
      return;
    }

    if (!email || !password) {
      response.status(400).send({
        error: 'Bad Request',
        message: 'Email or password is missing',
      });
      return;
    }

    const verifiedUser = await storage.verifyUser(email, password);
    if (!verifiedUser || !verifiedUser.item || verifiedUser.item.email !== email) {
      sendError(
        response,
        401,
        'Unauthorized',
        verifiedUser && verifiedUser.error
          ? verifiedUser.error
          : 'Login failed, please check your credentials',
      );
      return;
    }

    const token = jwt.sign({ email }, getJWTSecret(), { expiresIn: '1w' });
    response.status(200).send(serializeUser({ token }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    const email = request.email;
    if (!email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const result = await getStorageConnection().getUserByEmail(email);
    if (result && result.item && result.item.email) {
      response.status(200).send(serializeUser(result.item));
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      result && result.error ? result.error : 'An internal server error occurred',
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const { name } = extractAttributes(request.body);

    if (!email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const result = await getStorageConnection().updateUserByEmail(email, { name });
    if (result && result.item && result.item.email === email) {
      response.status(200).send(serializeUser({ name, email }));
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      result && result.error ? result.error : 'An internal server error occurred',
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateUserPassword = async (request, response) => {
  try {
    const email = request.email;
    const { currentPassword, newPassword } = extractAttributes(request.body);

    if (!email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const result = await getStorageConnection().updatePassword(
      email,
      currentPassword,
      newPassword,
    );

    if (result && result.item && result.item.email === email) {
      response.status(200).send(serializeUser({ email }));
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      result && result.message ? result.message : 'An internal server error occurred',
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    if (!request.email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const result = await getStorageConnection().getAllUsers();
    if (!result || !result.items) {
      throw new Error('An unexpected error occurred');
    }

    response.status(200).send(serializeUser(result.items));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAdminName = async (_request, response) => {
  try {
    const result = await getStorageConnection().getAllUsers();
    if (!result || !result.items) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const admin = result.items.find((user) => user.role === 'admin');
    if (!admin) {
      response.status(200).send();
      return;
    }

    response.status(200).send(serializeUser({ name: admin.name }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addUser = async (request, response) => {
  try {
    const requestingUserEmail = request.email;
    const { email, password, role } = extractAttributes(request.body);

    if (!requestingUserEmail || !email || !password || !role) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const storage = getStorageConnection();
    const requestingUser = await storage.getUserByEmail(requestingUserEmail);
    if (!requestingUser || !requestingUser.item || requestingUser.item.role !== 'admin') {
      sendError(
        response,
        403,
        'Forbidden',
        requestingUser && requestingUser.error ? requestingUser.error : 'Not allowed',
      );
      return;
    }

    const createdUser = await storage.createUser({
      name: 'User',
      email,
      password,
      role,
    });

    if (createdUser && createdUser.item && createdUser.item.email === email) {
      response.status(200).send(serializeUser(createdUser));
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      createdUser && createdUser.error
        ? createdUser.error
        : 'An internal server error occurred',
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.removeUser = async (request, response) => {
  try {
    const requestingUserEmail = request.email;
    const userId = request.params.userId;

    if (!requestingUserEmail || !userId) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const storage = getStorageConnection();
    const requestingUser = await storage.getUserByEmail(requestingUserEmail);
    if (!requestingUser || !requestingUser.item || requestingUser.item.role !== 'admin') {
      sendError(
        response,
        403,
        'Forbidden',
        requestingUser && requestingUser.error ? requestingUser.error : 'Not allowed',
      );
      return;
    }

    const deletedUser = await storage.deleteUser(userId);
    if (deletedUser) {
      response.status(200).send(serializeUser(deletedUser));
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      deletedUser && deletedUser.error
        ? deletedUser.error
        : 'An internal server error occurred',
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getTotalUsers = async (_request, response) => {
  try {
    const result = await getStorageConnection().getUserCount();
    response.send(serializeUser({ count: result.count }));
  } catch (error) {
    console.error(error);
    response.status(500).send({
      error: 'An error occurred while fetching user count.',
    });
  }
};
