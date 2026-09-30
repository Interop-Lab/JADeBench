'use strict';

const jwt = require('jsonwebtoken');
const JsonApiSerializer = require('json-api-serializer');
const { v4: uuid } = require('uuid');

const jsonApi = new JsonApiSerializer({ jsonapiObject: false });
jsonApi.register('users', {});
jsonApi.register('apps', {});
jsonApi.register('logs', {
  topLevelMeta(resource, meta) {
    return { meta };
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

async function addJWTSecret() {
  try {
    const connection = getStorageConnection();
    const storedConfig = await connection.getConfig('jwtSecret');

    if (storedConfig && storedConfig.item && storedConfig.item.key === 'jwtSecret') {
      jwtSecret = storedConfig.item.value;
    } else {
      const generatedSecret = uuid();
      const createdConfig = await connection.setConfig('jwtSecret', generatedSecret);
      if (createdConfig && createdConfig.item && createdConfig.item.key === 'jwtSecret') {
        jwtSecret = createdConfig.item.value;
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

function sendSerializedError(response, status, error, message) {
  response.status(status).send(jsonApi.serialize('users', { error, message }));
}

async function authenticateToken(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    sendSerializedError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) await addJWTSecret();
  const secret = getJWTSecret();

  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      sendSerializedError(response, 403, 'Forbidden', 'try again some time');
      return;
    }

    request.email = decoded.email;
    next();
  });
}

async function authenticateTokenWithAdmin(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    sendSerializedError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) await addJWTSecret();
  const secret = getJWTSecret();

  jwt.verify(token, secret, async (error, decoded) => {
    if (error) {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
      return;
    }

    request.email = decoded.email;
    const connection = getStorageConnection();
    const user = await connection.getUserByEmail(request.email);

    if (user && user.item && user.item.role === 'admin') {
      next();
    } else {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
    }
  });
}

module.exports = {
  authenticateToken,
  authenticateTokenWithAdmin,
};
