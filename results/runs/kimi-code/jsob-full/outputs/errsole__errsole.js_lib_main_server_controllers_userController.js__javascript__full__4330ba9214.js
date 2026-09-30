'use strict';

const path = require('path');
const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

let storageConnection;
const storageModule = {
  initializeStorageConnection(value) {
    storageConnection = value;
    return storageConnection;
  },
  getStorageConnection() {
    if (!storageConnection) throw new Error('Storage connection has not been initialized.');
    return storageConnection;
  },
};

const Serializer = new JsonApiSerializer({ jsonapiObject: false });
const UserType = 'users';
Serializer.register(UserType, {});
Serializer.register('apps', {});
Serializer.register('logs', {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});

const { getStorageConnection } = storageModule;
let jwtSecret;

function extractAttributes(body) {
  return body && body.data && body.data.attributes ? body.data.attributes : {};
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const existing = await storage.getConfig('jwtSecret');
    if (existing && existing.item && existing.item.key === 'jwtSecret') {
      jwtSecret = existing.item.value;
    } else {
      const value = uuid();
      const saved = await storage.setConfig('jwtSecret', value);
      if (saved && saved.item && saved.item.key === 'jwtSecret') {
        jwtSecret = saved.item.value;
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
  return Serializer.serialize(UserType, value);
}

function sendError(response, status, error, message) {
  return response.status(status).send({ errors: [{ error, message }] });
}

function sendInternalError(response, error) {
  return sendError(
    response,
    500,
    'Internal Server Error',
    error && error.message ? error.message : 'An unexpected error occurred',
  );
}

async function ensureJWTSecret() {
  return getJWTSecret() || addJWTSecret();
}

function serveIndexPage(_request, response) {
  response.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
}

async function createUser(request, response) {
  try {
    const { name, email, password, role } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const countResult = await storage.getUserCount();

    if (countResult && countResult.count !== 0) {
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

    const secret = await ensureJWTSecret();
    if (!secret) {
      return sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
    }

    const token = jwt.sign({ email }, secret, { expiresIn: '1w' });
    return response.status(201).send(serializeUser({ name, email, token }));
  } catch (error) {
    console.error(error);
    return sendInternalError(response, error);
  }
}

async function loginUser(request, response) {
  try {
    const { email, password } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const secret = await ensureJWTSecret();

    if (!secret) {
      return sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
    }
    if (!email || !password) {
      return response.status(400).send({ error: 'Bad Request', message: 'Email or password is missing' });
    }

    const result = await storage.verifyUser(email, password);
    if (!result || !result.item || result.item.email !== email) {
      return sendError(
        response,
        401,
        'Unauthorized',
        result && result.error ? result.error : 'Login failed, please check your credentials',
      );
    }

    const token = jwt.sign({ email }, secret, { expiresIn: '1w' });
    return response.status(200).send(serializeUser({ token }));
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function getUserProfile(request, response) {
  try {
    const email = request.email;
    if (!email) return sendError(response, 400, 'Bad Request', 'invalid request');

    const result = await getStorageConnection().getUserByEmail(email);
    if (result && result.item && result.item.email) {
      return response.status(200).send(serializeUser(result.item));
    }
    return sendError(
      response,
      500,
      'Internal Server Error',
      result && result.error ? result.error : 'An internal server error occurred',
    );
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function updateUserProfile(request, response) {
  try {
    const email = request.email;
    const { name } = extractAttributes(request.body);
    if (!email) return sendError(response, 400, 'Bad Request', 'invalid request');

    const result = await getStorageConnection().updateUserByEmail(email, { name });
    if (result && result.item && result.item.email === email) {
      return response.status(200).send(serializeUser({ name, email }));
    }
    return sendError(
      response,
      500,
      'Internal Server Error',
      result && result.error ? result.error : 'An internal server error occurred',
    );
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function updateUserPassword(request, response) {
  try {
    const email = request.email;
    const { currentPassword, newPassword } = extractAttributes(request.body);
    if (!email) return sendError(response, 400, 'Bad Request', 'invalid request');

    const result = await getStorageConnection().updatePassword(email, currentPassword, newPassword);
    if (result && result.item && result.item.email === email) {
      return response.status(200).send(serializeUser({ email }));
    }
    return sendError(
      response,
      500,
      'Internal Server Error',
      result && result.message ? result.message : 'An internal server error occurred',
    );
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function getAllUsers(request, response) {
  try {
    if (!request.email) return sendError(response, 400, 'Bad Request', 'invalid request');

    const result = await getStorageConnection().getAllUsers();
    if (!result || !result.items) throw new Error('An unexpected error occurred');
    return response.status(200).send(serializeUser(result.items));
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function getAdminName(_request, response) {
  try {
    const result = await getStorageConnection().getAllUsers();
    if (!result || !result.items) {
      return sendError(response, 400, 'Bad Request', 'invalid request');
    }

    const admin = result.items.find(user => user.role === 'admin');
    if (!admin) return response.status(200).send();
    return response.status(200).send(serializeUser({ name: admin.name }));
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function addUser(request, response) {
  try {
    const administratorEmail = request.email;
    const { email, password, role } = extractAttributes(request.body);
    if (!administratorEmail || !email || !password || !role) {
      return sendError(response, 400, 'Bad Request', 'invalid request');
    }

    const storage = getStorageConnection();
    const administrator = await storage.getUserByEmail(administratorEmail);
    if (!administrator || !administrator.item || administrator.item.role !== 'admin') {
      return sendError(
        response,
        403,
        'Forbidden',
        administrator && administrator.error ? administrator.error : 'Not allowed',
      );
    }

    const result = await storage.createUser({ name: 'User', email, password, role });
    if (result && result.item && result.item.email === email) {
      return response.status(200).send(serializeUser(result));
    }
    return sendError(
      response,
      500,
      'Internal Server Error',
      result && result.error ? result.error : 'An internal server error occurred',
    );
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function removeUser(request, response) {
  try {
    const administratorEmail = request.email;
    const userId = request.params.userId;
    if (!administratorEmail || !userId) {
      return sendError(response, 400, 'Bad Request', 'invalid request');
    }

    const storage = getStorageConnection();
    const administrator = await storage.getUserByEmail(administratorEmail);
    if (!administrator || !administrator.item || administrator.item.role !== 'admin') {
      return sendError(
        response,
        403,
        'Forbidden',
        administrator && administrator.error ? administrator.error : 'Not allowed',
      );
    }

    const result = await storage.deleteUser(userId);
    if (result) return response.status(200).send(serializeUser(result));
    return sendError(response, 500, 'Internal Server Error', 'An internal server error occurred');
  } catch (error) {
    return sendInternalError(response, error);
  }
}

async function getTotalUsers(_request, response) {
  try {
    const result = await getStorageConnection().getUserCount();
    return response.send(serializeUser({ count: result.count }));
  } catch (error) {
    console.error(error);
    return response.status(500).send({ error: 'An error occurred while fetching user count.' });
  }
}

exports.serveIndexPage = serveIndexPage;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
exports.updateUserPassword = updateUserPassword;
exports.getAllUsers = getAllUsers;
exports.getAdminName = getAdminName;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getTotalUsers = getTotalUsers;

Object.defineProperty(exports, '__setStorageConnectionForTests', {
  value: storageModule.initializeStorageConnection,
  enumerable: false,
});
