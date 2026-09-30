'use strict';

const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const USER_TYPE = 'users';
const APP_TYPE = 'apps';
const LOG_TYPE = 'logs';
const JWT_SECRET_KEY = 'jwtSecret';

const serializer = new JsonApiSerializer({ jsonapiObject: false });
serializer.register(USER_TYPE, {});
serializer.register(APP_TYPE, {});
serializer.register(LOG_TYPE, {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});

const Jsonapi = {
  UserType: USER_TYPE,
  AppType: APP_TYPE,
  LogType: LOG_TYPE,
  Serializer: serializer,
};

let storageConnection = null;
let jwtSecret;

// This module is normally loaded alongside the storage bootstrap module. The
// closure mirrors that shared connection holder from the bundled input.
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

function extractAttributes(document) {
  if (document && document.data && document.data.attributes) {
    return document.data.attributes;
  }
  return {};
}

function isSlackUrl(url) {
  const slackWebhookPattern =
    /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return slackWebhookPattern.test(url);
}

async function addJWTSecret() {
  try {
    const connection = getStorageConnection();
    const existingConfig = await connection.getConfig(JWT_SECRET_KEY);

    if (
      existingConfig &&
      existingConfig.item &&
      existingConfig.item.key === JWT_SECRET_KEY
    ) {
      jwtSecret = existingConfig.item.value;
    } else {
      const generatedSecret = uuid();
      const savedConfig = await connection.setConfig(
        JWT_SECRET_KEY,
        generatedSecret,
      );
      if (
        savedConfig &&
        savedConfig.item &&
        savedConfig.item.key === JWT_SECRET_KEY
      ) {
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
    Jsonapi.Serializer.serialize(Jsonapi.UserType, { error, message }),
  );
}

function bearerToken(request) {
  const authorization = request.headers.authorization;
  return authorization && authorization.split(' ')[1];
}

exports.authenticateToken = async (request, response, next) => {
  const token = bearerToken(request);
  if (token == null) {
    sendJsonApiError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) await addJWTSecret();
  const secret = getJWTSecret();

  jwt.verify(token, secret, (error, payload) => {
    if (error) {
      sendJsonApiError(response, 403, 'Forbidden', 'try again some time');
      return;
    }

    request.email = payload.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (request, response, next) => {
  const token = bearerToken(request);
  if (token == null) {
    sendJsonApiError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) await addJWTSecret();
  const secret = getJWTSecret();

  jwt.verify(token, secret, async (error, payload) => {
    if (error) {
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
      return;
    }

    response.status(403).send({
      errors: [{ error: 'Forbidden', message: 'Access denied' }],
    });
  });
};
