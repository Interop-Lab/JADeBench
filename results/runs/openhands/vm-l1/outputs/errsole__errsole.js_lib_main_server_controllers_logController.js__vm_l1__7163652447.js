'use strict';

const JSONAPISerializer = require('json-api-serializer');

const USER_TYPE = 'users';
const APP_TYPE = 'apps';
const LOG_TYPE = 'logs';
const serializer = new JSONAPISerializer({ jsonapiObject: false });

serializer.register(USER_TYPE);
serializer.register(APP_TYPE);
serializer.register(LOG_TYPE, {
  topLevelMeta: (_data, filters) => (filters ? { filters } : {}),
});

let storageConnection;

function initializeStorageConnection(connection) {
  if (connection) {
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

function sendInternalServerError(
  response,
  error,
  fallbackMessage = 'An unexpected error occurred',
  shouldLog = true,
) {
  if (shouldLog) {
    console.error(error);
  }
  response.status(500).send({
    errors: [
      {
        error: 'Internal Server Error',
        message: error && error.message ? error.message : fallbackMessage,
      },
    ],
  });
}

exports.getLogs = async (request, response) => {
  try {
    const filters = request.query || {};
    const searchTerms = filters.search_terms
      ? filters.search_terms.split(',')
      : undefined;

    if (filters.limit) {
      filters.limit = parseInt(filters.limit);
    }
    if (filters.levels) {
      filters.levels = filters.levels.split(',').map((level) => level.trim());
    }
    if (filters.level_json) {
      const levels = JSON.parse(filters.level_json);
      filters.level_json = levels.length === 0 ? [{}] : levels;
    }
    if (filters.hostnames) {
      const hostnames = JSON.parse(filters.hostnames);
      filters.hostnames = hostnames.length === 0 ? [] : hostnames;
    }

    const storage = getStorageConnection();
    const result = searchTerms
      ? await storage.searchLogs(searchTerms, filters)
      : await storage.getLogs(filters);

    if (result && result.items) {
      response.send(
        serializer.serialize(LOG_TYPE, result.items, result.filters),
      );
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.getLogsTTL = async (_request, response) => {
  try {
    const result = await getStorageConnection().getConfig('logsTTL');
    if (result && result.item) {
      response.send(serializer.serialize(LOG_TYPE, result.item));
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
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
    if (result && result.item) {
      await storage.ensureLogsTTL();
      response.send(serializer.serialize(LOG_TYPE, result.item));
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
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
    if (result && result.item) {
      response.send(serializer.serialize(LOG_TYPE, result.item));
      return;
    }

    sendBadRequest(response);
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(
        serializer.serialize(LOG_TYPE, { id: logId, meta: '{}' }),
      );
      return;
    }
    sendInternalServerError(response, error, undefined, false);
  }
};

exports.getHostnames = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    if (typeof storage.getHostnames !== 'function') {
      throw new TypeError('storageConnection.getHostnames is not a function');
    }
    const result = await storage.getHostnames();
    if (result && result.items) {
      response.send(
        serializer.serialize(LOG_TYPE, { hostnames: result.items }),
      );
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : undefined);
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getHostnames is not a function') {
      response.send(serializer.serialize(LOG_TYPE, {}));
      return;
    }
    sendInternalServerError(response, error, undefined, false);
  }
};

exports.deleteAllLogs = async (_request, response) => {
  try {
    await getStorageConnection().deleteAllLogs();
    response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message:
            error.message ||
            'An unexpected error occurred while deleting logs.',
        },
      ],
    });
  }
};

const storageModule = {
  initializeStorageConnection,
  getStorageConnection,
};

// Preserve the bundled storage singleton bridge without adding public exports.
globalThis.require_storageConnection = () => storageModule;
