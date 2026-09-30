'use strict';

const JsonApiSerializer = require('json-api-serializer');
const { v4: uuid } = require('uuid');

const TYPES = { UserType: 'users', AppType: 'apps', LogType: 'logs' };
const serializer = new JsonApiSerializer({ jsonapiObject: false });
serializer.register(TYPES.UserType, {});
serializer.register(TYPES.AppType, {});
serializer.register(TYPES.LogType, {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});

const Jsonapi = { ...TYPES, Serializer: serializer };
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

function extractAttributes(body) {
  return body?.data?.attributes || {};
}

function isSlackUrl(value) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(value);
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const existing = await storage.getConfig('jwtSecret');
    if (existing?.item?.key === 'jwtSecret') {
      jwtSecret = existing.item.value;
    } else {
      const created = await storage.setConfig('jwtSecret', uuid());
      if (created?.item?.key === 'jwtSecret') jwtSecret = created.item.value;
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

const helpers = { extractAttributes, SlackUrl: isSlackUrl, addJWTSecret, getJWTSecret };

function sendError(response, status, error, message) {
  return response.status(status).send({ errors: [{ error, message }] });
}

function sendBadRequest(response, result) {
  return sendError(response, 400, 'Bad Request', result?.error || 'invalid request');
}

function sendInternalError(response, exception, fallback = 'An unexpected error occurred') {
  console.error(exception);
  return sendError(response, 500, 'Internal Server Error', exception?.message || fallback);
}

exports.getLogs = async (request, response) => {
  try {
    const query = request.query || {};
    const searchTerms = query.search_terms?.split(',');
    if (query.limit) query.limit = parseInt(query.limit);
    if (query.levels) query.levels = query.levels.split(',').map(level => level.trim());
    if (query.level_json) {
      const levels = JSON.parse(query.level_json);
      query.level_json = levels.length === 0 ? [{}] : levels;
    }
    if (query.hostnames) {
      const hostnames = JSON.parse(query.hostnames);
      query.hostnames = hostnames.length === 0 ? [] : hostnames;
    }

    const storage = getStorageConnection();
    const result = searchTerms
      ? await storage.searchLogs(searchTerms, query)
      : await storage.getLogs(query);
    if (result?.items) {
      return response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.items, result.filters));
    }
    return sendBadRequest(response, result);
  } catch (error) {
    return sendInternalError(response, error);
  }
};

exports.getLogsTTL = async (_request, response) => {
  try {
    const result = await getStorageConnection().getConfig('logsTTL');
    if (result?.item) {
      return response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    }
    return sendBadRequest(response, result);
  } catch (error) {
    return sendInternalError(response, error);
  }
};

exports.updateLogsTTL = async (request, response) => {
  try {
    const { ttl } = helpers.extractAttributes(request.body);
    if (!ttl) return sendBadRequest(response);

    const storage = getStorageConnection();
    const result = await storage.setConfig('logsTTL', ttl);
    if (!result?.item) return sendBadRequest(response, result);

    await storage.ensureLogsTTL();
    return response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
  } catch (error) {
    return sendInternalError(response, error);
  }
};

exports.getLogMeta = async (request, response) => {
  const logId = request.params.logId;
  try {
    if (!logId) return sendBadRequest(response);
    const result = await getStorageConnection().getMeta(logId);
    if (result?.item) {
      return response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    }
    return sendBadRequest(response);
  } catch (error) {
    console.error(error);
    if (error?.message === 'storageConnection.getMeta is not a function') {
      return response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { id: logId, meta: '{}' }));
    }
    return sendInternalError(response, error);
  }
};

exports.getHostnames = async (_request, response) => {
  try {
    const result = await getStorageConnection().getHostnames();
    if (result?.items) {
      return response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { hostnames: result.items }));
    }
    return sendBadRequest(response, result);
  } catch (error) {
    console.error(error);
    if (error?.message === 'storageConnection.getHostnames is not a function') {
      return response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
    }
    return sendInternalError(response, error);
  }
};

exports.deleteAllLogs = async (_request, response) => {
  try {
    await getStorageConnection().deleteAllLogs();
    return response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    return sendInternalError(
      response,
      error,
      'An unexpected error occurred while deleting logs.',
    );
  }
};

// These bundled utilities are intentionally not public, but retaining named
// references documents the state shared by the exported handlers.
void initializeStorageConnection;
void helpers;
