'use strict';

const JsonApiSerializer = require('json-api-serializer');
const { v4: createUuid } = require('uuid');

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
let jwtSecret;

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

function SlackUrl(value) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(value);
}

async function addJWTSecret() {
  try {
    const connection = getStorageConnection();
    const existingSecret = await connection.getConfig('jwtSecret');

    if (existingSecret && existingSecret.item && existingSecret.item.key === 'jwtSecret') {
      jwtSecret = existingSecret.item.value;
    } else {
      const createdSecret = await connection.setConfig('jwtSecret', createUuid());
      if (createdSecret && createdSecret.item && createdSecret.item.key === 'jwtSecret') {
        jwtSecret = createdSecret.item.value;
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

const Jsonapi = { UserType, AppType, LogType, Serializer };
const helpers = { extractAttributes, SlackUrl, addJWTSecret, getJWTSecret };

function sendBadRequest(response, result, fallback = 'invalid request') {
  response.status(400).send({
    errors: [{
      error: 'Bad Request',
      message: result && result.error ? result.error : fallback,
    }],
  });
}

function sendInternalError(response, error, fallback = 'An unexpected error occurred') {
  console.error(error);
  response.status(500).send({
    errors: [{
      error: 'Internal Server Error',
      message: error && error.message ? error.message : fallback,
    }],
  });
}

exports.getLogs = async (request, response) => {
  try {
    const query = request.query || {};
    let searchTerms;

    if (query.search_terms) {
      searchTerms = query.search_terms.split(',');
    }
    if (query.limit) {
      query.limit = parseInt(query.limit);
    }
    if (query.levels) {
      query.levels = query.levels.split(',').map((level) => level.trim());
    }
    if (query.level_json) {
      query.level_json = JSON.parse(query.level_json).length === 0
        ? [{}]
        : JSON.parse(query.level_json);
    }
    if (query.hostnames) {
      query.hostnames = JSON.parse(query.hostnames).length === 0
        ? []
        : JSON.parse(query.hostnames);
    }

    const connection = getStorageConnection();
    const result = searchTerms
      ? await connection.searchLogs(searchTerms, query)
      : await connection.getLogs(query);

    if (result && result.items) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.items, result.filters));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getLogsTTL = async (_request, response) => {
  try {
    const result = await getStorageConnection().getConfig('logsTTL');
    if (result && result.item) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateLogsTTL = async (request, response) => {
  try {
    const { ttl } = helpers.extractAttributes(request.body);
    if (!ttl) {
      sendBadRequest(response);
      return;
    }

    const connection = getStorageConnection();
    const result = await connection.setConfig('logsTTL', ttl);
    if (result && result.item) {
      await connection.ensureLogsTTL();
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getLogMeta = async (request, response) => {
  const logId = request.params.logId;
  try {
    if (!logId) {
      sendBadRequest(response);
      return;
    }

    const result = await getStorageConnection().getMeta(logId);
    if (result && result.item) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      sendBadRequest(response);
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { id: logId, meta: '{}' }));
    } else {
      response.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: error && error.message ? error.message : 'An unexpected error occurred',
        }],
      });
    }
  }
};

exports.getHostnames = async (_request, response) => {
  try {
    const result = await getStorageConnection().getHostnames();
    if (result && result.items) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { hostnames: result.items }));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getHostnames is not a function') {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
    } else {
      response.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: error && error.message ? error.message : 'An unexpected error occurred',
        }],
      });
    }
  }
};

exports.deleteAllLogs = async (_request, response) => {
  try {
    await getStorageConnection().deleteAllLogs();
    response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    sendInternalError(response, error, 'An unexpected error occurred while deleting logs.');
  }
};

