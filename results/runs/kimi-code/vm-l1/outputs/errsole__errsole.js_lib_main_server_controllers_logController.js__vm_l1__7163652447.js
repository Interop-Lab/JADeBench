'use strict';

const JSONAPISerializer = require('json-api-serializer');

const UserType = 'users';
const AppType = 'apps';
const LogType = 'logs';

const Serializer = new JSONAPISerializer({ jsonapiObject: false });
Serializer.register(UserType, {});
Serializer.register(AppType, {});
Serializer.register(LogType, {
  topLevelMeta: (filters) => ({ filters }),
});

let storageConnection;

function initializeStorageConnection(connection) {
  storageConnection = connection;
  return connection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

const storageConnectionModule = {
  initializeStorageConnection,
  getStorageConnection,
};

function requireStorageConnection() {
  return storageConnectionModule;
}

globalThis.require_storageConnection = requireStorageConnection;

function extractAttributes(body) {
  return body && body.data && body.data.attributes
    ? body.data.attributes
    : {};
}

function sendBadRequest(response, message = 'invalid request') {
  response.status(400).send({
    errors: [{ error: 'Bad Request', message }],
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
      const levels = JSON.parse(query.level_json);
      query.level_json = levels.length === 0 ? [{}] : levels;
    }
    if (query.hostnames) {
      const hostnames = JSON.parse(query.hostnames);
      query.hostnames = hostnames.length === 0 ? [] : hostnames;
    }

    const connection = getStorageConnection();
    const result = searchTerms
      ? await connection.searchLogs(searchTerms, query)
      : await connection.getLogs(query);

    if (result && result.items) {
      response.send(Serializer.serialize(LogType, result.items, result.filters));
    } else {
      sendBadRequest(response, result && result.error ? result.error : 'invalid request');
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getLogsTTL = async (_request, response) => {
  try {
    const result = await getStorageConnection().getConfig('logsTTL');
    if (result && result.item) {
      response.send(Serializer.serialize(LogType, result.item));
    } else {
      sendBadRequest(response, result && result.error ? result.error : 'invalid request');
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateLogsTTL = async (request, response) => {
  try {
    const { ttl } = extractAttributes(request.body);
    if (!ttl) {
      sendBadRequest(response);
      return;
    }

    const connection = getStorageConnection();
    const result = await connection.setConfig('logsTTL', ttl);
    if (result && result.item) {
      await connection.ensureLogsTTL();
      response.send(Serializer.serialize(LogType, result.item));
    } else {
      sendBadRequest(response, result && result.error ? result.error : 'invalid request');
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
      response.send(Serializer.serialize(LogType, result.item));
    } else {
      sendBadRequest(response);
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(Serializer.serialize(LogType, { id: logId, meta: '{}' }));
    } else {
      sendInternalError(response, error);
    }
  }
};

exports.getHostnames = async (_request, response) => {
  try {
    const result = await getStorageConnection().getHostnames();
    if (result && result.items) {
      response.send(Serializer.serialize(LogType, { hostnames: result.items }));
    } else {
      sendBadRequest(response, result && result.error ? result.error : 'invalid request');
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getHostnames is not a function') {
      response.send(Serializer.serialize(LogType, {}));
    } else {
      sendInternalError(response, error);
    }
  }
};

exports.deleteAllLogs = async (_request, response) => {
  try {
    await getStorageConnection().deleteAllLogs();
    response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred while deleting logs.',
      }],
    });
  }
};
