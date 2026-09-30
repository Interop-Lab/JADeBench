'use strict';

const path = require('path');
const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const UserType = 'users';
const AppType = 'apps';
const LogType = 'logs';
const Serializer = new JsonApiSerializer({ jsonapiObject: false });

Serializer.register(UserType, {});
Serializer.register(AppType, {});
Serializer.register(LogType, {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});

const Jsonapi = { UserType, AppType, LogType, Serializer };

let storageConnection = null;
let jwtSecret;

function initializeStorageConnection(connection) {
  if (!storageConnection) {
    storageConnection = connection;
  }
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

function extractAttributes(body) {
  return body && body.data && body.data.attributes ? body.data.attributes : {};
}

function SlackUrl(value) {
  const slackWebhookPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return slackWebhookPattern.test(value);
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const storedConfig = await storage.getConfig('jwtSecret');

    if (storedConfig && storedConfig.item && storedConfig.item.key === 'jwtSecret') {
      jwtSecret = storedConfig.item.value;
    } else {
      const generatedSecret = uuidv4();
      const savedConfig = await storage.setConfig('jwtSecret', generatedSecret);
      if (savedConfig && savedConfig.item && savedConfig.item.key === 'jwtSecret') {
        jwtSecret = savedConfig.item.value;
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

const helpers = {
  extractAttributes,
  SlackUrl,
  addJWTSecret,
  getJWTSecret,
};

function sendError(response, status, error, message) {
  response.status(status).send({ errors: [{ error, message }] });
}

function internalErrorMessage(result) {
  return result && result.error ? result.error : 'An internal server error occurred';
}

function unexpectedErrorMessage(error) {
  return error ? error.message : 'An unexpected error occurred';
}

exports.serveIndexPage = (_request, response) => {
  response.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (request, response) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const userCount = await storage.getUserCount();

    if (userCount && userCount.count !== 0) {
      sendError(response, 409, 'Conflict', 'Main account already created');
    } else {
      const createdUser = await storage.createUser({ name, email, password, role });
      if (createdUser && createdUser.item) {
        if (!helpers.getJWTSecret()) {
          const secret = await helpers.addJWTSecret();
          if (!secret) {
            sendError(
              response,
              500,
              'Internal Server Error',
              'An internal server error occurred',
            );
            return;
          }
        }

        const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
        response
          .status(201)
          .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { name, email, token }));
      } else {
        sendError(
          response,
          500,
          'Internal Server Error',
          internalErrorMessage(createdUser),
        );
      }
    }
  } catch (error) {
    console.error(error);
    sendError(
      response,
      500,
      'Internal Server Error',
      error && error.message ? error.message : 'An unexpected error occurred',
    );
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const secret = await helpers.addJWTSecret();
      if (!secret) {
        sendError(
          response,
          500,
          'Internal Server Error',
          'An internal server error occurred',
        );
        return;
      }
    }

    if (email && password) {
      const verifiedUser = await storage.verifyUser(email, password);
      if (verifiedUser && verifiedUser.item && verifiedUser.item.email === email) {
        const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
        response
          .status(200)
          .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { token }));
      } else {
        sendError(
          response,
          401,
          'Unauthorized',
          verifiedUser && verifiedUser.error
            ? verifiedUser.error
            : 'Login failed, please check your credentials',
        );
      }
    } else {
      response.status(400).send({
        error: 'Bad Request',
        message: 'Email or password is missing',
      });
    }
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (email) {
      const user = await storage.getUserByEmail(email);
      if (user && user.item && user.item.email) {
        response
          .status(200)
          .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user.item));
      } else {
        sendError(
          response,
          500,
          'Internal Server Error',
          internalErrorMessage(user),
        );
      }
    } else {
      sendError(response, 400, 'Bad Request', 'invalid request');
    }
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.updateUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const { name } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (email) {
      const updatedUser = await storage.updateUserByEmail(email, { name });
      if (updatedUser && updatedUser.item && updatedUser.item.email === email) {
        response
          .status(200)
          .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { name, email }));
      } else {
        sendError(
          response,
          500,
          'Internal Server Error',
          internalErrorMessage(updatedUser),
        );
      }
    } else {
      sendError(response, 400, 'Bad Request', 'invalid request');
    }
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.updateUserPassword = async (request, response) => {
  try {
    const email = request.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (email) {
      const updatedUser = await storage.updatePassword(email, currentPassword, newPassword);
      if (updatedUser && updatedUser.item && updatedUser.item.email === email) {
        response
          .status(200)
          .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { email }));
      } else {
        sendError(
          response,
          500,
          'Internal Server Error',
          updatedUser && updatedUser.message
            ? updatedUser.message
            : 'An internal server error occurred',
        );
      }
    } else {
      sendError(response, 400, 'Bad Request', 'invalid request');
    }
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (email) {
      const users = await storage.getAllUsers();
      if (users && users.items) {
        response
          .status(200)
          .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, users.items));
      } else {
        throw new Error('An unexpected error occurred');
      }
    } else {
      sendError(response, 400, 'Bad Request', 'invalid request');
    }
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.getAdminName = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const users = await storage.getAllUsers();

    if (users && users.items) {
      const admin = users.items.find((user) => user.role === 'admin');
      if (admin) {
        return response
          .status(200)
          .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { name: admin.name }));
      }
      return response.status(200).send();
    }

    sendError(response, 400, 'Bad Request', 'invalid request');
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.addUser = async (request, response) => {
  try {
    const requestingUserEmail = request.email;
    const { email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (requestingUserEmail && email && password && role) {
      const requestingUser = await storage.getUserByEmail(requestingUserEmail);
      if (requestingUser && requestingUser.item && requestingUser.item.role === 'admin') {
        const createdUser = await storage.createUser({
          name: 'User',
          email,
          password,
          role,
        });
        if (createdUser && createdUser.item && createdUser.item.email === email) {
          response
            .status(200)
            .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, createdUser));
        } else {
          sendError(
            response,
            500,
            'Internal Server Error',
            createdUser.error || 'An internal server error occurred',
          );
        }
      } else {
        sendError(
          response,
          403,
          'Forbidden',
          requestingUser && requestingUser.error ? requestingUser.error : 'Not allowed',
        );
      }
    } else {
      sendError(response, 400, 'Bad Request', 'invalid request');
    }
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.removeUser = async (request, response) => {
  try {
    const requestingUserEmail = request.email;
    const userId = request.params.userId;
    const storage = getStorageConnection();

    if (requestingUserEmail && userId) {
      const requestingUser = await storage.getUserByEmail(requestingUserEmail);
      if (requestingUser && requestingUser.item && requestingUser.item.role === 'admin') {
        const deletedUser = await storage.deleteUser(userId);
        if (deletedUser) {
          response
            .status(200)
            .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, deletedUser));
        } else {
          sendError(
            response,
            500,
            'Internal Server Error',
            deletedUser.error || 'An internal server error occurred',
          );
        }
      } else {
        sendError(
          response,
          403,
          'Forbidden',
          requestingUser && requestingUser.error ? requestingUser.error : 'Not allowed',
        );
      }
    } else {
      sendError(response, 400, 'Bad Request', 'invalid request');
    }
  } catch (error) {
    sendError(
      response,
      500,
      'Internal Server Error',
      unexpectedErrorMessage(error),
    );
  }
};

exports.getTotalUsers = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const userCount = await storage.getUserCount();
    response.send(
      Jsonapi.Serializer.serialize(Jsonapi.UserType, { count: userCount.count }),
    );
  } catch (error) {
    console.error(error);
    response.status(500).send({
      error: 'An error occurred while fetching user count.',
    });
  }
};
