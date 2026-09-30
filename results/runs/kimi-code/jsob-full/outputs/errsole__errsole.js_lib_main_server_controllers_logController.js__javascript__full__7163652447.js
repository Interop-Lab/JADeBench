'use strict';

const JsonApiSerializer = require('json-api-serializer');

const serializer = new JsonApiSerializer({ jsonapiObject: false });
const UserType = 'users';
const AppType = 'apps';
const LogType = 'logs';

serializer.register(UserType, {});
serializer.register(AppType, {});
serializer.register(LogType, {
  topLevelMeta(_data, filters) {
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

const storage = {
  initializeStorageConnection,
  getStorageConnection,
};

function extractAttributes(body) {
  if (body && body.data && body.data.attributes) {
    return body.data.attributes;
  }
  return {};
}

function sendBadRequest(response, message = 'invalid request') {
  response.status(400).send({ errors: [{ error: 'Bad Request', message }] });
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

async function getLogs(request, response) {
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
      query.levels = query.levels.split(',').map(level => level.trim());
    }
    if (query.level_json) {
      const levels = JSON.parse(query.level_json);
      query.level_json = levels.length === 0 ? [{}] : levels;
    }
    if (query.hostnames) {
      const hostnames = JSON.parse(query.hostnames);
      query.hostnames = hostnames.length === 0 ? [] : hostnames;
    }

    const connection = storage.getStorageConnection();
    const result = searchTerms
      ? await connection.searchLogs(searchTerms, query)
      : await connection.getLogs(query);

    if (result && result.items) {
      response.send(serializer.serialize(LogType, result.items, result.filters));
      return;
    }
    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
    sendInternalError(response, error);
  }
}

async function getLogsTTL(_request, response) {
  try {
    const result = await storage.getStorageConnection().getConfig('logsTTL');
    if (result && result.item) {
      response.send(serializer.serialize(LogType, result.item));
      return;
    }
    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
    sendInternalError(response, error);
  }
}

async function updateLogsTTL(request, response) {
  try {
    const { ttl } = extractAttributes(request.body);
    if (!ttl) {
      sendBadRequest(response);
      return;
    }

    const connection = storage.getStorageConnection();
    const result = await connection.setConfig('logsTTL', ttl);
    if (result && result.item) {
      await connection.ensureLogsTTL();
      response.send(serializer.serialize(LogType, result.item));
      return;
    }
    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
    sendInternalError(response, error);
  }
}

async function getLogMeta(request, response) {
  const logId = request.params.logId;
  try {
    if (!logId) {
      sendBadRequest(response);
      return;
    }

    const result = await storage.getStorageConnection().getMeta(logId);
    if (result && result.item) {
      response.send(serializer.serialize(LogType, result.item));
      return;
    }
    sendBadRequest(response);
  } catch (error) {
    if (error.message === 'storageConnection.getMeta is not a function') {
      console.error(error);
      response.send(serializer.serialize(LogType, { id: logId, meta: '{}' }));
      return;
    }
    sendInternalError(response, error);
  }
}

async function getHostnames(_request, response) {
  try {
    const result = await storage.getStorageConnection().getHostnames();
    if (result && result.items) {
      response.send(serializer.serialize(LogType, { hostnames: result.items }));
      return;
    }
    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
    if (error.message === 'storageConnection.getHostnames is not a function') {
      console.error(error);
      response.send(serializer.serialize(LogType, {}));
      return;
    }
    sendInternalError(response, error);
  }
}

async function deleteAllLogs(_request, response) {
  try {
    await storage.getStorageConnection().deleteAllLogs();
    response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    sendInternalError(response, error, 'An unexpected error occurred while deleting logs.');
  }
}

module.exports = {
  getLogs,
  getLogsTTL,
  updateLogsTTL,
  getLogMeta,
  getHostnames,
  deleteAllLogs,
};

