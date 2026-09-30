'use strict';

const path = require('path');
const Serializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: createUuid } = require('uuid');

const Jsonapi = {
  AppType: 'apps',
  UserType: 'users',
  LogType: 'logs',
  Serializer: new Serializer({ jsonapiObject: false }),
};

Jsonapi.Serializer.register(Jsonapi.UserType, {});
Jsonapi.Serializer.register(Jsonapi.AppType, {});
Jsonapi.Serializer.register(Jsonapi.LogType, {
  topLevelMeta(_records, filters) {
    return { filters };
  },
});

let storageConnection = null;

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

let jwtSecret;

function extractAttributes(body) {
  return body?.data?.attributes || {};
}

function isSlackUrl(value) {
  const slackWebhookPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return slackWebhookPattern.test(value);
}

async function addJwtSecret() {
  try {
    const storage = getStorageConnection();
    const storedSecret = await storage.getConfig('jwtSecret');

    if (storedSecret?.item?.key === 'jwtSecret') {
      jwtSecret = storedSecret.item.value;
    } else {
      const newSecret = createUuid();
      const savedSecret = await storage.setConfig('jwtSecret', newSecret);
      if (savedSecret?.item?.key === 'jwtSecret') {
        jwtSecret = savedSecret.item.value;
      }
    }

    return jwtSecret || false;
  } catch (error) {
    console.error('An error occurred in addJWTSecret:', error);
    throw error;
  }
}

function getJwtSecret() {
  return jwtSecret || false;
}

const helpers = {
  extractAttributes,
  SlackUrl: isSlackUrl,
  addJWTSecret: addJwtSecret,
  getJWTSecret: getJwtSecret,
};

function sendError(response, status, error, message) {
  response.status(status).send({ errors: [{ error, message }] });
}

function unexpectedMessage(error) {
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
      return;
    }

    const createdUser = await storage.createUser({ name, email, password, role });
    if (!createdUser?.item) {
      sendError(
        response,
        500,
        'Internal Server Error',
        createdUser?.error || 'An internal server error occurred',
      );
      return;
    }

    if (!helpers.getJWTSecret() && !(await helpers.addJWTSecret())) {
      sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
      return;
    }

    const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
    response.status(201).send(
      Jsonapi.Serializer.serialize(Jsonapi.UserType, { name, email, token }),
    );
  } catch (error) {
    console.error(error);
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret() && !(await helpers.addJWTSecret())) {
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
    if (!verifiedUser?.item || verifiedUser.item.email !== email) {
      sendError(
        response,
        401,
        'Unauthorized',
        verifiedUser?.error || 'Login failed, please check your credentials',
      );
      return;
    }

    const token = jwt.sign({ email }, helpers.getJWTSecret(), { expiresIn: '1w' });
    response.status(200).send(
      Jsonapi.Serializer.serialize(Jsonapi.UserType, { token }),
    );
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    const { email } = request;
    const storage = getStorageConnection();

    if (!email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const user = await storage.getUserByEmail(email);
    if (user?.item?.email) {
      response.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, user.item));
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      user?.error || 'An internal server error occurred',
    );
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.updateUserProfile = async (request, response) => {
  try {
    const { email } = request;
    const { name } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const updatedUser = await storage.updateUserByEmail(email, { name });
    if (updatedUser?.item?.email === email) {
      response.status(200).send(
        Jsonapi.Serializer.serialize(Jsonapi.UserType, { name, email }),
      );
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      updatedUser?.error || 'An internal server error occurred',
    );
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.updateUserPassword = async (request, response) => {
  try {
    const { email } = request;
    const { currentPassword, newPassword } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const updatedUser = await storage.updatePassword(email, currentPassword, newPassword);
    if (updatedUser?.item?.email === email) {
      response.status(200).send(
        Jsonapi.Serializer.serialize(Jsonapi.UserType, { email }),
      );
      return;
    }

    sendError(
      response,
      500,
      'Internal Server Error',
      updatedUser?.message || 'An internal server error occurred',
    );
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    if (!request.email) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const users = await getStorageConnection().getAllUsers();
    if (!users?.items) {
      throw new Error('An unexpected error occurred');
    }

    response.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, users.items));
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.getAdminName = async (_request, response) => {
  try {
    const users = await getStorageConnection().getAllUsers();
    if (!users?.items) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const admin = users.items.find((user) => user.role === 'admin');
    if (!admin) {
      response.status(200).send();
      return;
    }

    response.status(200).send(
      Jsonapi.Serializer.serialize(Jsonapi.UserType, { name: admin.name }),
    );
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.addUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const { email, password, role } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!adminEmail || !email || !password || !role) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const admin = await storage.getUserByEmail(adminEmail);
    if (!admin?.item || admin.item.role !== 'admin') {
      sendError(response, 403, 'Forbidden', admin?.error || 'Not allowed');
      return;
    }

    const createdUser = await storage.createUser({ name: 'User', email, password, role });
    if (!createdUser?.item || createdUser.item.email !== email) {
      sendError(
        response,
        500,
        'Internal Server Error',
        createdUser.error || 'An internal server error occurred',
      );
      return;
    }

    response.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, createdUser));
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.removeUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const userId = request.params.userId;
    const storage = getStorageConnection();

    if (!adminEmail || !userId) {
      sendError(response, 400, 'Bad Request', 'invalid request');
      return;
    }

    const admin = await storage.getUserByEmail(adminEmail);
    if (!admin?.item || admin.item.role !== 'admin') {
      sendError(response, 403, 'Forbidden', admin?.error || 'Not allowed');
      return;
    }

    const deletedUser = await storage.deleteUser(userId);
    if (!deletedUser) {
      sendError(
        response,
        500,
        'Internal Server Error',
        deletedUser.error || 'An internal server error occurred',
      );
      return;
    }

    response.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, deletedUser));
  } catch (error) {
    sendError(response, 500, 'Internal Server Error', unexpectedMessage(error));
  }
};

exports.getTotalUsers = async (_request, response) => {
  try {
    const userCount = await getStorageConnection().getUserCount();
    response.send(
      Jsonapi.Serializer.serialize(Jsonapi.UserType, { count: userCount.count }),
    );
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: 'An error occurred while fetching user count.' });
  }
};
