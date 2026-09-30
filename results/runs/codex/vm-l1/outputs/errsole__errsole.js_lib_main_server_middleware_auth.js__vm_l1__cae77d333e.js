'use strict';

const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: createUuid } = require('uuid');

const UserType = 'users';
const AppType = 'apps';
const LogType = 'logs';

const Serializer = new JsonApiSerializer({ jsonapiObject: false });
Serializer.register(UserType, {});
Serializer.register(AppType, {});
Serializer.register(LogType, {
  topLevelMeta(_records, filters) {
    return { filters };
  },
});

let storageConnection;

function initializeStorageConnection(connection) {
  storageConnection = connection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

function extractAttributes(document) {
  return document && document.data && document.data.attributes
    ? document.data.attributes
    : {};
}

function isSlackUrl(value) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(value);
}

let jwtSecret = false;

async function addJWTSecret() {
  try {
    const connection = getStorageConnection();
    const result = await connection.getConfig('jwtSecret');

    if (result && result.item && result.item.value) {
      jwtSecret = result.item.value;
    } else {
      await connection.setConfig('jwtSecret', createUuid());
    }
  } catch (error) {
    console.error('An error occurred in addJWTSecret:', error);
  }
}

function getJWTSecret() {
  return jwtSecret;
}

async function authenticateToken(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    const error = {
      error: 'Unauthorized',
      message: 'invalid session',
    };
    response
      .status(401)
      .send(Serializer.serialize(UserType, error));
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  jwt.verify(token, getJWTSecret(), (verificationError, payload) => {
    if (verificationError) {
      const error = {
        error: 'Forbidden',
        message: 'try again some time',
      };
      response
        .status(403)
        .send(Serializer.serialize(UserType, error));
      return;
    }

    request.email = payload.email;
    next();
  });
}

async function authenticateTokenWithAdmin(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    const error = {
      error: 'Unauthorized',
      message: 'invalid session',
    };
    response
      .status(401)
      .send(Serializer.serialize(UserType, error));
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  jwt.verify(token, getJWTSecret(), async (verificationError, payload) => {
    if (verificationError) {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
      return;
    }

    request.email = payload.email;
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

exports.authenticateToken = authenticateToken;
exports.authenticateTokenWithAdmin = authenticateTokenWithAdmin;
