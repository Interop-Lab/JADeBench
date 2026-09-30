'use strict';

const JSONAPISerializer = require('json-api-serializer');

const LOG_TYPE = 'logs';
const serializer = new JSONAPISerializer({ jsonapiObject: false });

// Every response includes the storage adapter's filters as top-level metadata.
serializer.register(LOG_TYPE, {
  topLevelMeta(_data, filters) {
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

// The bundled input publishes this module loader globally. Keep that integration
// point so the application bootstrap can install its storage adapter.
const storageModule = { initializeStorageConnection, getStorageConnection };
globalThis.require_storageConnection = () => storageModule;
globalThis.getStorageConnection = getStorageConnection;

function extractAttributes(document) {
  return document && document.data && document.data.attributes
    ? document.data.attributes
    : {};
}

function serializeLogs(data, filters) {
  return serializer.serialize(LOG_TYPE, data, filters);
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
    const searchTerms = query.search_terms
      ? query.search_terms.split(',')
      : undefined;

    if (query.limit) query.limit = parseInt(query.limit);
    if (query.levels) query.levels = query.levels.split(',').map(level => level.trim());
    if (query.level_json) {
      const levels = JSON.parse(query.level_json);
      query.level_json = levels.length === 0 ? [{}] : JSON.parse(query.level_json);
    }
    if (query.hostnames) {
      const hostnames = JSON.parse(query.hostnames);
      query.hostnames = hostnames.length === 0 ? [] : JSON.parse(query.hostnames);
    }

    const storage = getStorageConnection();
    const result = searchTerms
      ? await storage.searchLogs(searchTerms, query)
      : await storage.getLogs(query);

    if (result && result.items) {
      response.send(serializeLogs(result.items, result.filters));
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
      response.send(serializeLogs(result.item));
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

    const storage = getStorageConnection();
    const result = await storage.setConfig('logsTTL', ttl);
    if (result && result.item) {
      await storage.ensureLogsTTL();
      response.send(serializeLogs(result.item));
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
      response.send(serializeLogs(result.item));
    } else {
      sendBadRequest(response);
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(serializeLogs({ id: logId, meta: '{}' }));
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
      response.send(serializeLogs({ hostnames: result.items }));
    } else {
      sendBadRequest(response, result && result.error ? result.error : 'invalid request');
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getHostnames is not a function') {
      response.send(serializeLogs({}));
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
    sendInternalError(
      response,
      error,
      'An unexpected error occurred while deleting logs.',
    );
  }
};
