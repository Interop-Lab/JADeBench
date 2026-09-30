'use strict';

const JSONAPISerializer = require('json-api-serializer');
const { v4: uuidv4 } = require('uuid');

const UserType = 'users';
const AppType = 'apps';
const LogType = 'logs';
const Serializer = new JSONAPISerializer({ jsonapiObject: false });

Serializer.register(UserType, {});
Serializer.register(AppType, {});
Serializer.register(LogType, {
  topLevelMeta(data, filters) {
    return { filters };
  },
});

const Jsonapi = { UserType, AppType, LogType, Serializer };

let storageConnection = null;

function initializeStorageConnection(storage) {
  if (!storageConnection) {
    storageConnection = storage;
  }
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

let jwtSecret;

const helpers = {
  extractAttributes(body) {
    if (body && body.data && body.data.attributes) {
      return body.data.attributes;
    }
    return {};
  },

  SlackUrl(url) {
    const slackWebhookPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
    return slackWebhookPattern.test(url);
  },

  async addJWTSecret() {
    try {
      const storage = getStorageConnection();
      const storedSecret = await storage.getConfig('jwtSecret');

      if (
        storedSecret &&
        storedSecret.item &&
        storedSecret.item.key === 'jwtSecret'
      ) {
        jwtSecret = storedSecret.item.value;
      } else {
        const generatedSecret = uuidv4();
        const savedSecret = await storage.setConfig('jwtSecret', generatedSecret);
        if (
          savedSecret &&
          savedSecret.item &&
          savedSecret.item.key === 'jwtSecret'
        ) {
          jwtSecret = savedSecret.item.value;
        }
      }

      return jwtSecret || false;
    } catch (error) {
      console.error('An error occurred in addJWTSecret:', error);
      throw error;
    }
  },

  getJWTSecret() {
    return jwtSecret || false;
  },
};

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

function sendInternalServerError(
  response,
  error,
  fallbackMessage = 'An unexpected error occurred',
) {
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
    let searchTerms;

    if (filters.search_terms) {
      searchTerms = filters.search_terms.split(',');
    }
    if (filters.limit) {
      filters.limit = parseInt(filters.limit);
    }
    if (filters.levels) {
      filters.levels = filters.levels.split(',').map((level) => level.trim());
    }
    if (filters.level_json) {
      filters.level_json =
        filters.level_json && JSON.parse(filters.level_json).length === 0
          ? [{}]
          : JSON.parse(filters.level_json);
    }
    if (filters.hostnames) {
      filters.hostnames =
        filters.hostnames && JSON.parse(filters.hostnames).length === 0
          ? []
          : JSON.parse(filters.hostnames);
    }

    const storage = getStorageConnection();
    const result = searchTerms
      ? await storage.searchLogs(searchTerms, filters)
      : await storage.getLogs(filters);

    if (result && result.items) {
      response.send(
        Jsonapi.Serializer.serialize(
          Jsonapi.LogType,
          result.items,
          result.filters,
        ),
      );
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.getLogsTTL = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('logsTTL');

    if (result && result.item) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.updateLogsTTL = async (request, response) => {
  try {
    const { ttl } = helpers.extractAttributes(request.body);

    if (!ttl) {
      sendBadRequest(response);
      return;
    }

    const storage = getStorageConnection();
    const result = await storage.setConfig('logsTTL', ttl);

    if (result && result.item) {
      await storage.ensureLogsTTL();
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      sendBadRequest(response, result);
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
    const result = await storage.getMeta(logId);

    if (result && result.item) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      sendBadRequest(response);
    }
  } catch (error) {
    console.error(error);

    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, {
          id: logId,
          meta: '{}',
        }),
      );
    } else {
      sendInternalServerError(response, error);
    }
  }
};

exports.getHostnames = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getHostnames();

    if (result && result.items) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, {
          hostnames: result.items,
        }),
      );
    } else {
      sendBadRequest(response, result);
    }
  } catch (error) {
    console.error(error);

    if (error.message === 'storageConnection.getHostnames is not a function') {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
    } else {
      sendInternalServerError(response, error);
    }
  }
};

exports.deleteAllLogs = async (request, response) => {
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
            error.message ||
            'An unexpected error occurred while deleting logs.',
        },
      ],
    });
  }
};
