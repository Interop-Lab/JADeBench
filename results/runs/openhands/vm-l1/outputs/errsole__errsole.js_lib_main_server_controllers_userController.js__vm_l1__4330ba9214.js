'use strict';

const path = require('path');
const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: createUuid } = require('uuid');

const Serializer = new JsonApiSerializer({ jsonapiObject: false });
const Jsonapi = {
  UserType: 'users',
  AppType: 'apps',
  LogType: 'logs',
  Serializer,
};

Serializer.register(Jsonapi.UserType, {});
Serializer.register(Jsonapi.AppType, {});
Serializer.register(Jsonapi.LogType, {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});

let storageConnection;
let jwtSecret = false;

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
  return body && body.data && body.data.attributes;
}

function SlackUrl(url) {
  const slackWebhookPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return slackWebhookPattern.test(url);
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    let result = await storage.getConfig('jwtSecret');

    if (result && result.item && result.item.key === 'jwtSecret') {
      jwtSecret = result.item.value;
    }

    if (!jwtSecret) {
      const newSecret = createUuid();
      result = await storage.setConfig('jwtSecret', newSecret);

      if (result && result.item && result.item.key === 'jwtSecret') {
        jwtSecret = result.item.value;
      }
    }

    return jwtSecret || false;
  } catch (error) {
    console.error('An error occurred in addJWTSecret:', error);
    return false;
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

function serializeUser(data) {
  return Jsonapi.Serializer.serialize(Jsonapi.UserType, data);
}

function internalErrorMessage(result) {
  return result && result.error
    ? result.error
    : 'An internal server error occurred';
}

function unexpectedErrorMessage(error) {
  return error && error.message
    ? error.message
    : 'An unexpected error occurred';
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
      response.status(409).send({
        errors: [{ error: 'Conflict', message: 'Main account already created' }],
      });
      return;
    }

    const createdUser = await storage.createUser({ name, email, password, role });
    if (!createdUser || !createdUser.item) {
      response.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: internalErrorMessage(createdUser),
        }],
      });
      return;
    }

    if (!helpers.getJWTSecret()) {
      const secretWasCreated = await helpers.addJWTSecret();
      if (!secretWasCreated) {
        response.status(500).send({
          errors: [{
            error: 'Internal Server Error',
            message: 'An internal server error occurred',
          }],
        });
        return;
      }
    }

    const token = jwt.sign(
      { email },
      helpers.getJWTSecret(),
      { expiresIn: '1w' },
    );
    response.status(201).send(serializeUser({ name, email, token }));
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: unexpectedErrorMessage(error),
      }],
    });
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const secretWasCreated = await helpers.addJWTSecret();
      if (!secretWasCreated) {
        response.status(500).send({
          errors: [{
            error: 'Internal Server Error',
            message: 'An internal server error occurred',
          }],
        });
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

    const verifiedUser = await storage.verifyUser(email, password);
    if (!verifiedUser || !verifiedUser.item || verifiedUser.item.email !== email) {
      response.status(401).send({
        errors: [{
          error: 'Unauthorized',
          message: verifiedUser && verifiedUser.error
            ? verifiedUser.error
            : 'Login failed, please check your credentials',
        }],
      });
      return;
    }

    const token = jwt.sign(
      { email },
      helpers.getJWTSecret(),
      { expiresIn: '1w' },
    );
    response.status(200).send(serializeUser({ token }));
  } catch (error) {
    response.status(500).send({
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
      response.status(400).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const userResult = await storage.getUserByEmail(email);
    if (userResult && userResult.item && userResult.item.email) {
      response.status(200).send(serializeUser(userResult.item));
      return;
    }

    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: internalErrorMessage(userResult),
      }],
    });
  } catch (error) {
    response.status(500).send({
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
      response.status(400).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const updatedUser = await storage.updateUserByEmail(email, { name });
    if (updatedUser && updatedUser.item && updatedUser.item.email === email) {
      response.status(200).send(serializeUser({ name, email }));
      return;
    }

    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: internalErrorMessage(updatedUser),
      }],
    });
  } catch (error) {
    response.status(500).send({
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
      response.status(400).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const updatedUser = await storage.updatePassword(
      email,
      currentPassword,
      newPassword,
    );
    if (updatedUser && updatedUser.item && updatedUser.item.email === email) {
      response.status(200).send(serializeUser({ email }));
      return;
    }

    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: updatedUser && updatedUser.message
          ? updatedUser.message
          : 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(500).send({
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
      response.status(400).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const usersResult = await storage.getAllUsers();
    if (!usersResult || !usersResult.items) {
      throw new Error('An unexpected error occurred');
    }

    response.status(200).send(serializeUser(usersResult.items));
  } catch (error) {
    response.status(500).send({
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
    const usersResult = await storage.getAllUsers();

    if (!usersResult || !usersResult.items) {
      response.status(400).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const admin = usersResult.items.find((user) => user.role === 'admin');
    if (admin) {
      return response.status(200).send(serializeUser({ name: admin.name }));
    }

    return response.status(200).send();
  } catch (error) {
    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.addUser = async (request, response) => {
  try {
    const currentUserEmail = request.email;
    const { email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!currentUserEmail || !email || !password || !role) {
      response.status(400).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const currentUser = await storage.getUserByEmail(currentUserEmail);
    if (!currentUser || !currentUser.item || currentUser.item.role !== 'admin') {
      response.status(403).send({
        errors: [{
          error: 'Forbidden',
          message: currentUser && currentUser.error
            ? currentUser.error
            : 'Not allowed',
        }],
      });
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

    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: createdUser.error || 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: error ? error.message : 'An unexpected error occurred',
      }],
    });
  }
};

exports.removeUser = async (request, response) => {
  try {
    const currentUserEmail = request.email;
    const userId = request.params.userId;
    const storage = getStorageConnection();

    if (!currentUserEmail || !userId) {
      response.status(400).send({
        errors: [{ error: 'Bad Request', message: 'invalid request' }],
      });
      return;
    }

    const currentUser = await storage.getUserByEmail(currentUserEmail);
    if (!currentUser || !currentUser.item || currentUser.item.role !== 'admin') {
      response.status(403).send({
        errors: [{
          error: 'Forbidden',
          message: currentUser && currentUser.error
            ? currentUser.error
            : 'Not allowed',
        }],
      });
      return;
    }

    const deletedUser = await storage.deleteUser(userId);
    if (deletedUser) {
      response.status(200).send(serializeUser(deletedUser));
      return;
    }

    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: deletedUser.error || 'An internal server error occurred',
      }],
    });
  } catch (error) {
    response.status(500).send({
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
    const userCount = await storage.getUserCount();
    response.send(serializeUser({ count: userCount.count }));
  } catch (error) {
    console.error(error);
    response.status(500).send({
      error: 'An error occurred while fetching user count.',
    });
  }
};
