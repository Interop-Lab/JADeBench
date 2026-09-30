'use strict';

const Jsonapi = require('./utils/jsonapiUtil.js');
const { getStorageConnection } = require('./storageConnection.js');
const helpers = require('./utils/helpers.js');

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
      query.level_json =
        JSON.parse(query.level_json).length === 0
          ? [{}]
          : JSON.parse(query.level_json);
    }

    if (query.filters) {
      query.filters =
        JSON.parse(query.filters).length === 0
          ? []
          : JSON.parse(query.filters);
    }

    const storageConnection = getStorageConnection();
    let result = {};

    if (searchTerms) {
      result = await storageConnection.searchLogs(searchTerms, query);
    } else {
      result = await storageConnection.getLogs(query);
    }

    if (result && result.items) {
      response.send(
        Jsonapi.Serializer.serialize(
          Jsonapi.LogType,
          result.items,
          result.meta
        )
      );
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message:
              result && result.error
                ? result.error
                : 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message:
            error && error.message
              ? error.message
              : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getLogsTTL = async (request, response) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getConfig('logsTTL');

    if (result && result.item) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item)
      );
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message:
              result && result.error
                ? result.error
                : 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message:
            error && error.message
              ? error.message
              : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.updateLogsTTL = async (request, response) => {
  try {
    const { ttl } = helpers.extractAttributes(request.body);

    if (ttl) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.setConfig('logsTTL', ttl);

      if (result && result.item) {
        await storageConnection.ensureLogsTTL();
        response.send(
          Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item)
        );
      } else {
        response.status(400).send({
          errors: [
            {
              error: 'Bad Request',
              message:
                result && result.error
                  ? result.error
                  : 'invalid request'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message:
            error && error.message
              ? error.message
              : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getLogMeta = async (request, response) => {
  const logId = request.params.logId;

  try {
    if (logId) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.getMeta(logId);

      if (result && result.item) {
        response.send(
          Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item)
        );
      } else {
        response.status(400).send({
          errors: [
            {
              error: 'Bad Request',
              message: 'invalid request'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);

    if (error.message === 'storageConnection.getMeta is not a function') {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, {
          id: logId,
          meta: '{}'
        })
      );
    } else {
      response.status(500).send({
        errors: [
          {
            error: 'Internal Server Error',
            message:
              error && error.message
                ? error.message
                : 'An unexpected error occurred'
          }
        ]
      });
    }
  }
};

exports.getHostnames = async (request, response) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getHostnames();

    if (result && result.items) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, {
          hostnames: result.items
        })
      );
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message:
              result && result.error
                ? result.error
                : 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);

    if (
      error.message ===
      'storageConnection.getHostnames is not a function'
    ) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.LogType, {})
      );
    } else {
      response.status(500).send({
        errors: [
          {
            error: 'Internal Server Error',
            message:
              error && error.message
                ? error.message
                : 'An unexpected error occurred'
          }
        ]
      });
    }
  }
};

exports.deleteAllLogs = async (request, response) => {
  try {
    const storageConnection = getStorageConnection();
    await storageConnection.deleteAllLogs();

    response.send({
      message: 'All logs have been successfully deleted.'
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message:
            error.message ||
            'An unexpected error occurred while deleting logs.'
        }
      ]
    });
  }
};
