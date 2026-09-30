'use strict';

const JsonApiSerializer = require('json-api-serializer');

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

function extractAttributes(body) {
  if (body && body.data && body.data.attributes) {
    return body.data.attributes;
  }
  return {};
}

function sendBadRequest(response, result) {
  response.status(400).send({
    errors: [
      {
        error: 'Bad Request',
        message: result && result.error ? result.error : 'invalid request',
      },
    ],
  });
}

function sendServerError(response, error, fallbackMessage = 'An unexpected error occurred') {
  console.error(error);
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

    const storage = getStorageConnection();
    const result = searchTerms
      ? await storage.searchLogs(searchTerms, query)
      : await storage.getLogs(query);

    if (result && result.items) {
      response.send(Serializer.serialize(LogType, result.items, result.filters));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    sendServerError(response, error);
  }
};

exports.getLogsTTL = async (_request, response) => {
  try {
    const result = await getStorageConnection().getConfig('logsTTL');
    if (result && result.item) {
      response.send(Serializer.serialize(LogType, result.item));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    sendServerError(response, error);
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
      await storage.updateLogsTTL();
      response.send(Serializer.serialize(LogType, result.item));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    sendServerError(response, error);
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
    if (error.message === 'storageConnection.getMeta is not a function') {
      console.error(error);
      response.send(Serializer.serialize(LogType, { id: logId, meta: '{}' }));
    } else {
      sendServerError(response, error);
    }
  }
};

exports.getHostnames = async (_request, response) => {
  try {
    const result = await getStorageConnection().getHostnames();
    if (result && result.items) {
      response.send(Serializer.serialize(LogType, { hostnames: result.items }));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    if (error.message === 'storageConnection.getHostnames is not a function') {
      console.error(error);
      response.send(Serializer.serialize(LogType, {}));
    } else {
      sendServerError(response, error);
    }
  }
};

exports.deleteAllLogs = async (_request, response) => {
  try {
    await getStorageConnection().deleteAllLogs();
    response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    sendServerError(response, error, 'An unexpected error occurred while deleting logs.');
  }
};
