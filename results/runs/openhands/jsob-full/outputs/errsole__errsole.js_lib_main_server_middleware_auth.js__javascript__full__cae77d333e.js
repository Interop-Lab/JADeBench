'use strict';

const JsonApiSerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const USER_TYPE = 'users';
const APP_TYPE = 'apps';
const LOG_TYPE = 'logs';
const JWT_SECRET_KEY = 'jwtSecret';
const ADMIN_ROLE = 'admin';

const serializer = new JsonApiSerializer({ jsonapiObject: false });
serializer.register(USER_TYPE, {});
serializer.register(APP_TYPE, {});
serializer.register(LOG_TYPE, {
  topLevelMeta(_data, filters) {
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

function extractAttributes(response) {
  if (response && response.data && response.data.attributes) {
    return response.data.attributes;
  }
  return {};
}

function isSlackUrl(url) {
  const slackWebhookPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
  return slackWebhookPattern.test(url);
}

async function addJWTSecret() {
  try {
    const connection = getStorageConnection();
    const storedConfig = await connection.getConfig(JWT_SECRET_KEY);

    if (
      storedConfig &&
      storedConfig.item &&
      storedConfig.item.key === JWT_SECRET_KEY
    ) {
      jwtSecret = storedConfig.item.value;
    } else {
      const generatedSecret = uuidv4();
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

const helpers = {
  extractAttributes,
  SlackUrl: isSlackUrl,
  addJWTSecret,
  getJWTSecret,
};

const storage = {
  initializeStorageConnection,
  getStorageConnection,
};

function sendSerializedError(response, status, error, message) {
  const body = Jsonapi.Serializer.serialize(Jsonapi.UserType, {
    error,
    message,
  });
  response.status(status).send(body);
}

async function ensureJWTSecret() {
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  return helpers.getJWTSecret();
}

exports.authenticateToken = async (request, response, next) => {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    sendSerializedError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  const secret = await ensureJWTSecret();
  jwt.verify(token, secret, (error, decodedToken) => {
    if (error) {
      sendSerializedError(response, 403, 'Forbidden', 'try again some time');
      return;
    }

    request.email = decodedToken.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (request, response, next) => {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    sendSerializedError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  const secret = await ensureJWTSecret();
  jwt.verify(token, secret, async (error, decodedToken) => {
    if (error) {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
      return;
    }

    request.email = decodedToken.email;
    const connection = storage.getStorageConnection();
    const user = await connection.getUserByEmail(request.email);

    if (user && user.item && user.item.role === ADMIN_ROLE) {
      next();
    } else {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
    }
  });
};
