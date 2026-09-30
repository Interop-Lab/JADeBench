'use strict';

const JsonApiSerializer = require('json-api-serializer');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

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

function extractAttributes(document) {
  if (document && document.data && document.data.attributes) {
    return document.data.attributes;
  }
  return {};
}

function SlackUrl(url) {
  const slackWebhookPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return slackWebhookPattern.test(url);
}

const JWT_SECRET_KEY = 'jwtSecret';
let jwtSecret;

async function addJWTSecret() {
  try {
    const connection = getStorageConnection();
    const existingConfig = await connection.getConfig(JWT_SECRET_KEY);

    if (existingConfig && existingConfig.item && existingConfig.item.key === JWT_SECRET_KEY) {
      jwtSecret = existingConfig.item.value;
    } else {
      const generatedSecret = uuid();
      const savedConfig = await connection.setConfig(JWT_SECRET_KEY, generatedSecret);
      if (savedConfig && savedConfig.item && savedConfig.item.key === JWT_SECRET_KEY) {
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

function sendJsonApiError(response, status, error, message) {
  response.status(status).send(
    Serializer.serialize(UserType, { error, message }),
  );
}

async function authenticateToken(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    sendJsonApiError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  const secret = getJWTSecret();
  jwt.verify(token, secret, (error, decodedToken) => {
    if (error) {
      sendJsonApiError(response, 403, 'Forbidden', 'try again some time');
      return;
    }

    request.email = decodedToken.email;
    next();
  });
}

async function authenticateTokenWithAdmin(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    sendJsonApiError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  const secret = getJWTSecret();
  jwt.verify(token, secret, async (error, decodedToken) => {
    if (error) {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
      return;
    }

    request.email = decodedToken.email;
    const connection = getStorageConnection();
    const user = await connection.getUserByEmail(request.email);

    if (user && user.item && user.item.role === 'admin') {
      next();
      return;
    }

    response.status(403).send({
      errors: [{ error: 'Forbidden', message: 'Access denied' }],
    });
  });
}

exports.authenticateToken = authenticateToken;
exports.authenticateTokenWithAdmin = authenticateTokenWithAdmin;
