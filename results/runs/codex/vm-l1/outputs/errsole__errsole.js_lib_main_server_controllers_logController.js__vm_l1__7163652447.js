'use strict';

const Jsonapi = require('../utils/jsonapiUtil');
const { getStorageConnection } = require('../storageConnection');
const helpers = require('../utils/helpers');

const BAD_REQUEST = 'Bad Request';
const INTERNAL_SERVER_ERROR = 'Internal Server Error';
const INVALID_REQUEST = 'invalid request';
const UNEXPECTED_ERROR = 'An unexpected error occurred';

function sendBadRequest(response, message = INVALID_REQUEST) {
  response.status(400).send({
    errors: [{ error: BAD_REQUEST, message }],
  });
}

function sendInternalServerError(response, error, fallbackMessage = UNEXPECTED_ERROR) {
  console.error(error);
  response.status(500).send({
    errors: [
      {
        error: INTERNAL_SERVER_ERROR,
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
      query.level_json = levels.length === 0 ? [{}] : JSON.parse(query.level_json);
    }
    if (query.hostnames) {
      const hostnames = JSON.parse(query.hostnames);
      query.hostnames = hostnames.length === 0 ? [] : JSON.parse(query.hostnames);
    }

    const storageConnection = getStorageConnection();
    const result = searchTerms
      ? await storageConnection.searchLogs(searchTerms, query)
      : await storageConnection.getLogs(query);

    if (result && result.items) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, result.items, result.filters),
      );
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : INVALID_REQUEST);
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.getLogsTTL = async (_request, response) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getConfig('logsTTL');

    if (result && result.item) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : INVALID_REQUEST);
  } catch (error) {
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

    const storageConnection = getStorageConnection();
    const result = await storageConnection.setConfig('logsTTL', ttl);

    if (result && result.item) {
      await storageConnection.ensureLogsTTL();
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : INVALID_REQUEST);
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

    const storageConnection = getStorageConnection();
    const result = await storageConnection.getMeta(logId);

    if (result && result.item) {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      return;
    }

    sendBadRequest(response);
  } catch (error) {
    console.error(error);

    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, { id: logId, meta: '{}' }),
      );
      return;
    }

    response.status(500).send({
      errors: [
        {
          error: INTERNAL_SERVER_ERROR,
          message: error && error.message ? error.message : UNEXPECTED_ERROR,
        },
      ],
    });
  }
};

exports.getHostnames = async (_request, response) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getHostnames();

    if (result && result.items) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, { hostnames: result.items }),
      );
      return;
    }

    sendBadRequest(response, result && result.error ? result.error : INVALID_REQUEST);
  } catch (error) {
    console.error(error);

    if (error.message === 'storageConnection.getHostnames is not a function') {
      response.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
      return;
    }

    response.status(500).send({
      errors: [
        {
          error: INTERNAL_SERVER_ERROR,
          message: error && error.message ? error.message : UNEXPECTED_ERROR,
        },
      ],
    });
  }
};

exports.deleteAllLogs = async (_request, response) => {
  try {
    const storageConnection = getStorageConnection();
    await storageConnection.deleteAllLogs();
    response.send({ message: 'All logs have been successfully deleted.' });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: INTERNAL_SERVER_ERROR,
          message:
            error.message || 'An unexpected error occurred while deleting logs.',
        },
      ],
    });
  }
};
