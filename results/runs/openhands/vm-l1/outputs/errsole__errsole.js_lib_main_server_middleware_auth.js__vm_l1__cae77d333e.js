'use strict';

const JSONAPISerializer = require('json-api-serializer');
const jwt = require('jsonwebtoken');
const { v4: createUuid } = require('uuid');

const UserType = 'users';
const AppType = 'apps';
const LogType = 'logs';

const Serializer = new JSONAPISerializer({ jsonapiObject: false });
Serializer.register(UserType, {});
Serializer.register(AppType, {});
Serializer.register(LogType, {
  topLevelMeta(_records, filters) {
    return { filters };
  },
});

const Jsonapi = { UserType, AppType, LogType, Serializer };

let storageConnection;

function initializeStorageConnection(connection) {
  storageConnection ||= connection;
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

const storageModule = { initializeStorageConnection, getStorageConnection };

let jwtSecret = false;

function extractAttributes(payload) {
  return payload?.data?.attributes || {};
}

function SlackUrl(value) {
  return /^https?:\/\/hooks\.slack\.com\/services\/[^/]+\/[^/]+\/[^/?#]+$/i.test(value);
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const storedSecret = await storage.getConfig('jwtSecret');

    if (storedSecret?.item?.key === 'jwtSecret') {
      jwtSecret = storedSecret.item.value;
    } else {
      jwtSecret = createUuid();
      await storage.setConfig('jwtSecret', jwtSecret);
    }

    return jwtSecret;
  } catch (error) {
    console.error('An error occurred in addJWTSecret:', error);
    throw error;
  }
}

function getJWTSecret() {
  return jwtSecret;
}

const helpers = { extractAttributes, SlackUrl, addJWTSecret, getJWTSecret };

function getBearerToken(request) {
  const authorization = request.headers.authorization;
  return authorization && authorization.split(' ')[1];
}

function sendSerializedError(response, statusCode, error, message) {
  response.status(statusCode).send(
    Serializer.serialize(UserType, { error, message }),
  );
}

function sendAccessDenied(response) {
  response.status(403).send({
    errors: [{ error: 'Forbidden', message: 'Access denied' }],
  });
}

exports.authenticateToken = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    sendSerializedError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  jwt.verify(token, getJWTSecret(), (error, payload) => {
    if (error) {
      sendSerializedError(response, 403, 'Forbidden', 'try again some time');
      return;
    }

    request.email = payload.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    sendSerializedError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!getJWTSecret()) {
    await addJWTSecret();
  }

  jwt.verify(token, getJWTSecret(), async (error, payload) => {
    if (error) {
      sendAccessDenied(response);
      return;
    }

    request.email = payload.email;
    const storage = getStorageConnection();
    const user = await storage.getUserByEmail(request.email);

    if (user?.item?.role === 'admin') {
      next();
    } else {
      sendAccessDenied(response);
    }
  });
};

// The original bundle made these shared modules globally reachable.
globalThis.Jsonapi = Jsonapi;
globalThis.helpers = helpers;
globalThis.getStorageConnection = getStorageConnection;
globalThis.require_jsonapiUtil = () => Jsonapi;
globalThis.require_storageConnection = () => storageModule;
globalThis.require_helpers = () => helpers;
globalThis.jwt = jwt;
