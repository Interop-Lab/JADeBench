'use strict';

const jwt = require('jsonwebtoken');
const JsonApiSerializer = require('json-api-serializer');
const { v4: createUuid } = require('uuid');

const Serializer = new JsonApiSerializer({ jsonapiObject: false });
const UserType = 'users';
const AppType = 'apps';
const LogType = 'logs';

Serializer.register(UserType);
Serializer.register(AppType);
Serializer.register(LogType, {
  topLevelMeta: (data) => data.filters,
});

let storageConnection;
let jwtSecret = false;

function initializeStorageConnection(connection) {
  storageConnection = connection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const storedConfig = await storage.getConfig('jwtSecret');

    if (storedConfig && storedConfig.item) {
      jwtSecret = storedConfig.item.value;
      return;
    }

    jwtSecret = createUuid();
    await storage.setConfig({ key: 'jwtSecret', value: jwtSecret });
  } catch (error) {
    console.error('An error occurred in addJWTSecret:', error);
  }
}

function getJWTSecret() {
  return jwtSecret || false;
}

function serializeError(error, message) {
  return Serializer.serialize(UserType, { error, message });
}

function getBearerToken(request) {
  const authorization = request.headers.authorization;
  return authorization && authorization.split(' ')[1];
}

exports.authenticateToken = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    response.status(401).send(serializeError('Unauthorized', 'invalid session'));
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  jwt.verify(token, getJWTSecret(), (error, payload) => {
    if (error) {
      response.status(403).send(serializeError('Forbidden', 'try again some time'));
      return;
    }

    request.email = payload.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    response.status(401).send(serializeError('Unauthorized', 'invalid session'));
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  jwt.verify(token, getJWTSecret(), async (error, payload) => {
    if (error) {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
      return;
    }

    request.email = payload.email;
    const user = await getStorageConnection().getUserByEmail(request.email);
    if (user && user.item && user.item.role === 'admin') {
      next();
    } else {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
    }
  });
};
