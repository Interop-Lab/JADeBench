'use strict';

const jwt = require('jsonwebtoken');
const JSONAPISerializer = require('json-api-serializer');
const { v4: uuid } = require('uuid');

function createCommonJSModule(factory) {
  let module;
  return function loadModule() {
    if (!module) {
      module = { exports: {} };
      factory(module.exports, module);
    }
    return module.exports;
  };
}

const requireJsonapiUtil = createCommonJSModule((unusedExports, module) => {
  const Serializer = new JSONAPISerializer({ jsonapiObject: false });
  const UserType = 'users';
  const AppType = 'apps';
  const LogType = 'logs';

  Serializer.register(UserType, {});
  Serializer.register(AppType, {});
  Serializer.register(LogType, {
    topLevelMeta(unusedRecord, filters) {
      return { filters };
    },
  });

  module.exports = { UserType, AppType, LogType, Serializer };
});

const requireStorageConnection = createCommonJSModule((unusedExports, module) => {
  let storageConnection = null;

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

  module.exports = { initializeStorageConnection, getStorageConnection };
});

const requireHelpers = createCommonJSModule((exports) => {
  const { getStorageConnection } = requireStorageConnection();
  let jwtSecret;

  exports.extractAttributes = (resource) => {
    if (resource && resource.data && resource.data.attributes) {
      return resource.data.attributes;
    }
    return {};
  };

  exports.SlackUrl = (url) => {
    const slackWebhookPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
    return slackWebhookPattern.test(url);
  };

  exports.addJWTSecret = async () => {
    try {
      const storage = getStorageConnection();
      const existingSecret = await storage.getConfig('jwtSecret');

      if (existingSecret && existingSecret.item && existingSecret.item.key === 'jwtSecret') {
        jwtSecret = existingSecret.item.value;
      } else {
        const newSecret = uuid();
        const savedSecret = await storage.setConfig('jwtSecret', newSecret);
        if (savedSecret && savedSecret.item && savedSecret.item.key === 'jwtSecret') {
          jwtSecret = savedSecret.item.value;
        }
      }

      return jwtSecret || false;
    } catch (error) {
      console.error('An error occurred in addJWTSecret:', error);
      throw error;
    }
  };

  exports.getJWTSecret = () => jwtSecret || false;
});

const Jsonapi = requireJsonapiUtil();
const helpers = requireHelpers();
const { getStorageConnection } = requireStorageConnection();

function sendSerializedAuthenticationError(response, status, error, message) {
  response.status(status).send(
    Jsonapi.Serializer.serialize(Jsonapi.UserType, { error, message }),
  );
}

exports.authenticateToken = async (request, response, next) => {
  const authorization = request.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  if (token == null) {
    sendSerializedAuthenticationError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!helpers.getJWTSecret()) await helpers.addJWTSecret();
  const secret = helpers.getJWTSecret();

  jwt.verify(token, secret, (error, decodedToken) => {
    if (error) {
      sendSerializedAuthenticationError(response, 403, 'Forbidden', 'try again some time');
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
    sendSerializedAuthenticationError(response, 401, 'Unauthorized', 'invalid session');
    return;
  }

  if (!helpers.getJWTSecret()) await helpers.addJWTSecret();
  const secret = helpers.getJWTSecret();

  jwt.verify(token, secret, async (error, decodedToken) => {
    if (error) {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
      return;
    }

    request.email = decodedToken.email;
    const storage = getStorageConnection();
    const user = await storage.getUserByEmail(request.email);

    if (user && user.item && user.item.role === 'admin') {
      next();
    } else {
      response.status(403).send({
        errors: [{ error: 'Forbidden', message: 'Access denied' }],
      });
    }
  });
};
