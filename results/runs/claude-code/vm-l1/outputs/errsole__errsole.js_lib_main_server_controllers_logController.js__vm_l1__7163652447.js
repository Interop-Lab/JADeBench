'use strict';

const JSONAPISerializer = require('json-api-serializer');

const LOG_TYPE = 'logs';
const serializer = new JSONAPISerializer({ jsonapiObject: false });

serializer.register(LOG_TYPE, {
  id: 'id',
  topLevelMeta: (_data, filters) => ({ filters }),
});

let storageConnection;

function initializeStorageConnection(connection) {
  storageConnection = connection;
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

function extractAttributes(document) {
  return document?.data?.attributes || {};
}

function serializeLogs(data, filters) {
  return serializer.serialize(LOG_TYPE, data, filters);
}

function sendBadRequest(response, message) {
  response.status(400).send({
    errors: [{ error: 'Bad Request', message: message || 'invalid request' }],
  });
}

function sendInternalServerError(response, error) {
  response.status(500).send({
    errors: [
      {
        error: 'Internal Server Error',
        message: error?.message || 'An unexpected error occurred',
      },
    ],
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

    const storage = getStorageConnection();
    const result = searchTerms
      ? await storage.searchLogs(searchTerms, query)
      : await storage.getLogs(query);

    if (result?.items) {
      response.send(serializeLogs(result.items, result.filters));
    } else {
      sendBadRequest(response, result?.error);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.getLogsTTL = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('logsTTL');

    if (result?.item) {
      response.send(serializeLogs(result.item));
    } else {
      sendBadRequest(response, result?.error);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
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

    if (result?.item) {
      await storage.ensureLogsTTL();
      response.send(serializeLogs(result.item));
    } else {
      sendBadRequest(response, result?.error);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.getLogMeta = async (request, response) => {
  const logId = request.params.logId;

  try {
    if (!logId) {
      sendBadRequest(response);
      return;
    }

    const storage = getStorageConnection();
    if (typeof storage.getMeta !== 'function') {
      throw new TypeError('storageConnection.getMeta is not a function');
    }
    const result = await storage.getMeta(logId);

    if (result?.item) {
      response.send(serializeLogs(result.item));
    } else {
      sendBadRequest(response);
    }
  } catch (error) {
    console.error(error);

    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(serializeLogs({ id: logId, meta: '{}' }));
    } else {
      sendInternalServerError(response, error);
    }
  }
};

exports.getHostnames = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    if (typeof storage.getHostnames !== 'function') {
      throw new TypeError('storageConnection.getHostnames is not a function');
    }
    const result = await storage.getHostnames();

    if (result?.items) {
      response.send(serializeLogs({ hostnames: result.items }));
    } else {
      sendBadRequest(response, result?.error);
    }
  } catch (error) {
    console.error(error);

    if (error.message === 'storageConnection.getHostnames is not a function') {
      response.send(serializeLogs({}));
    } else {
      sendInternalServerError(response, error);
    }
  }
};

exports.deleteAllLogs = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    await storage.deleteAllLogs();
    response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message:
            error.message || 'An unexpected error occurred while deleting logs.',
        },
      ],
    });
  }
};

// The original bundle exposed this cached module wrapper globally, allowing
// the application bootstrap to initialize the shared storage connection.
globalThis.require_storageConnection = () => ({
  initializeStorageConnection,
  getStorageConnection,
});
