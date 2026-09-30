'use strict';

const path = require('path');
const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const AppType = 'apps';
const UserType = 'users';
const LogType = 'logs';
const Serializer = new JsonApiSerializer({ jsonapiObject: false });
Serializer.register(AppType, {});
Serializer.register(UserType, {});
Serializer.register(LogType, {
  topLevelMeta(_data, filters) {
    return { filters };
  },
});

let storageConnection = null;
let jwtSecret;

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

function extractAttributes(body) {
  return body && body.data && body.data.attributes ? body.data.attributes : {};
}

function SlackUrl(url) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(url);
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const existing = await storage.getConfig('jwtSecret');
    if (existing && existing.item && existing.item.key === 'jwtSecret') {
      jwtSecret = existing.item.value;
    } else {
      const created = await storage.setConfig('jwtSecret', uuid());
      if (created && created.item && created.item.key === 'jwtSecret') {
        jwtSecret = created.item.value;
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

const helpers = { extractAttributes, SlackUrl, addJWTSecret, getJWTSecret };

function sendError(response, status, error, message, wrap = true) {
  const detail = { error, message };
  response.status(status).send(wrap ? { errors: [detail] } : detail);
}

function sendInternalError(response, error) {
  sendError(
    response,
    500,
    'Internal Server Error',
    error && error.message ? error.message : 'An unexpected error occurred',
  );
}

exports.serveIndexPage = (_request, response) => {
  response.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (request, response) => {
  try {
    const { name, email, password, role } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const count = await storage.getUserCount();

    if (count && count.count !== 0) {
      return sendError(response, 409, 'Conflict', 'Main account already created');
    }

    const result = await storage.createUser({ name, email, password, role });
    if (!result || !result.item) {
      return sendError(
        response,
        500,
        'Internal Server Error',
        result && result.error ? result.error : 'An internal server error occurred',
      );
    }

    if (!getJWTSecret() && !(await addJWTSecret())) {
      return sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
    }

    const token = jwt.sign({ email }, getJWTSecret(), { expiresIn: '1w' });
    response.status(201).send(Serializer.serialize(UserType, { name, email, token }));
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
      return sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
    }
    if (!email || !password) {
      return sendError(response, 400, 'Bad Request', 'Email or password is missing', false);
    }

    const result = await storage.verifyUser(email, password);
    if (result && result.item && result.item.email === email) {
      const token = jwt.sign({ email }, getJWTSecret(), { expiresIn: '1w' });
      return response.status(200).send(Serializer.serialize(UserType, { token }));
    }
    sendError(
      response,
      401,
      'Unauthorized',
      result && result.error ? result.error : 'Login failed, please check your credentials',
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    if (!request.email) return sendError(response, 400, 'Bad Request', 'invalid request');
    const result = await getStorageConnection().getUserByEmail(request.email);
    if (result && result.item && result.item.email) {
      return response.status(200).send(Serializer.serialize(UserType, result.item));
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
    if (!email) return sendError(response, 400, 'Bad Request', 'invalid request');

    const result = await getStorageConnection().updateUserByEmail(email, { name });
    if (result && result.item && result.item.email === email) {
      return response.status(200).send(Serializer.serialize(UserType, { name, email }));
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
    if (!email) return sendError(response, 400, 'Bad Request', 'invalid request');

    const result = await getStorageConnection().updatePassword(email, currentPassword, newPassword);
    if (result && result.item && result.item.email === email) {
      return response.status(200).send(Serializer.serialize(UserType, { email }));
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
    if (!request.email) return sendError(response, 400, 'Bad Request', 'invalid request');
    const result = await getStorageConnection().getAllUsers();
    if (!result || !result.items) throw new Error('An unexpected error occurred');
    response.status(200).send(Serializer.serialize(UserType, result.items));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAdminName = async (_request, response) => {
  try {
    const result = await getStorageConnection().getAllUsers();
    if (!result || !result.items) {
      return sendError(response, 400, 'Bad Request', 'invalid request');
    }
    const admin = result.items.find((user) => user.role === 'admin');
    if (!admin) return response.status(200).send();
    response.status(200).send(Serializer.serialize(UserType, { name: admin.name }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const { email, password, role } = extractAttributes(request.body);
    if (!adminEmail || !email || !password || !role) {
      return sendError(response, 400, 'Bad Request', 'invalid request');
    }

    const storage = getStorageConnection();
    const admin = await storage.getUserByEmail(adminEmail);
    if (!admin || !admin.item || admin.item.role !== 'admin') {
      return sendError(
        response,
        403,
        'Forbidden',
        admin && admin.error ? admin.error : 'Not allowed',
      );
    }

    const result = await storage.createUser({ name: 'User', email, password, role });
    if (result && result.item && result.item.email === email) {
      return response.status(200).send(Serializer.serialize(UserType, result));
    }
    sendError(
      response,
      500,
      'Internal Server Error',
      result.error || 'An internal server error occurred',
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.removeUser = async (request, response) => {
  try {
    const adminEmail = request.email;
    const userId = request.params.userId;
    if (!adminEmail || !userId) return sendError(response, 400, 'Bad Request', 'invalid request');

    const storage = getStorageConnection();
    const admin = await storage.getUserByEmail(adminEmail);
    if (!admin || !admin.item || admin.item.role !== 'admin') {
      return sendError(
        response,
        403,
        'Forbidden',
        admin && admin.error ? admin.error : 'Not allowed',
      );
    }

    const result = await storage.deleteUser(userId);
    if (result) return response.status(200).send(Serializer.serialize(UserType, result));
    sendError(response, 500, 'Internal Server Error', result.error || 'An internal server error occurred');
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getTotalUsers = async (_request, response) => {
  try {
    const result = await getStorageConnection().getUserCount();
    response.send(Serializer.serialize(UserType, { count: result.count }));
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: 'An error occurred while fetching user count.' });
  }
};

// These are intentionally module-local in the bundled input. Keeping them
// here documents how the surrounding server supplies its storage adapter.
void initializeStorageConnection;
void helpers;
