'use strict';

const { getStorageConnection } = require('./storageConnection');
const helpers = require('./utils/helpers');
const Jsonapi = require('./utils/jsonapiUtil');

function sendError(response, error) {
  console.error(error);
  response.status(500).json({
    errors: [
      {
        code: 'INTERNAL_SERVER_ERROR',
        detail: error && error.message ? error.message : 'Internal server error'
      }
    ]
  });
}

function sendNotFound(response, id, detail) {
  response.status(400).json({
    errors: [
      {
        id,
        detail
      }
    ]
  });
}

exports.getLogs = async (request, response) => {
  try {
    const query = request.query || {};
    let ids;

    if (query.ids) {
      ids = query.ids.split(',').map((id) => id.trim());
    }

    if (query.limit) {
      query.limit = parseInt(query.limit, 10);
    }

    if (query.tags) {
      query.tags = query.tags.split(',').map((tag) => tag.trim());
    }

    if (query.json) {
      query.json =
        JSON.parse(query.json).length > 0 ? [{}] : JSON.parse(query.json);
    }

    if (query.fields) {
      query.fields = query.fields.split(',').map((field) => field.trim());
    }

    const storage = getStorageConnection();
    const result = ids
      ? await storage.getLogs(ids, query)
      : await storage.getLogs(query);

    if (result && result.data) {
      response.json(
        Jsonapi.serializer.serialize(Jsonapi.type, result.data)
      );
    } else {
      sendNotFound(response, 'logs', 'Logs not found');
    }
  } catch (error) {
    sendError(response, error);
  }
};

exports.getLogDetails = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getLogDetails();

    if (result && result.data) {
      response.json(
        Jsonapi.serializer.serialize(Jsonapi.type, result.data)
      );
    } else {
      sendNotFound(response, 'logs', 'Log details not found');
    }
  } catch (error) {
    sendError(response, error);
  }
};

exports.getVersion = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getVersion();

    if (result && result.data) {
      response.json(
        Jsonapi.serializer.serialize(Jsonapi.type, result.data)
      );
    } else {
      sendNotFound(response, 'version', 'Version not found');
    }
  } catch (error) {
    sendError(response, error);
  }
};

exports.getStorageStats = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getStorageStats();

    if (result && result.data) {
      const payload = {
        logs: result.data
      };
      response.json(
        Jsonapi.serializer.serialize(Jsonapi.type, payload)
      );
    } else {
      sendNotFound(response, 'storage', 'Storage statistics not found');
    }
  } catch (error) {
    sendError(response, error);
  }
};

exports.closeStorageConnection = async (request, response) => {
  try {
    const storage = getStorageConnection();
    await storage.close();

    response.json({
      message: 'Storage connection closed'
    });
  } catch (error) {
    sendError(response, error);
  }
};
