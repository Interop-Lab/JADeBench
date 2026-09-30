'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (callback, module) => function () {
  return module || (callback[__getOwnPropNames(callback)[0]]((module = { exports: {} }).exports, module), module.exports);
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js' (exports, module) {
    'use strict';
    var JsonapiSerializer = require('jsonapi-serializer');
    const serializerOptions = {};
    serializerOptions.keyForAttribute = false;
    var serializer = new JsonapiSerializer(serializerOptions);
    var jsonapiUtil = {};
    jsonapiUtil.ok = 'ok';
    jsonapiUtil.error = 'error';
    jsonapiUtil.serializer = serializer;
    jsonapiUtil.serializerOptions = {
      topLevelMeta: function (data, extraData) {
        const result = {};
        result.meta = extraData;
        return result;
      }
    };
    jsonapiUtil.serializer = serializer;
    module.exports = jsonapiUtil;
  }
});

var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js' (exports, module) {
    'use strict';
    var storageConnection = null;
    function setStorageConnection(connection) {
      return !storageConnection && (storageConnection = connection), storageConnection;
    }
    function getStorageConnection() {
      if (!storageConnection) {
        throw new Error('Storage connection is not initialized. Call setStorageConnection first.');
      }
      return storageConnection;
    }
    const storageConnectionModule = {};
    storageConnectionModule.setStorageConnection = setStorageConnection;
    storageConnectionModule.getStorageConnection = getStorageConnection;
    module.exports = storageConnectionModule;
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js' (exports) {
    'use strict';
    var { v4: uuidv4 } = require('uuid');
    var { getStorageConnection } = require_storageConnection();
    var slackWebhookUrl;

    exports.getLogFilterOptions = (query) => {
      if (query && query.options && query.options.filters) {
        return query.options.filters;
      } else {
        return {};
      }
    };

    exports.isValidSlackWebhookUrl = (url) => {
      const slackWebhookUrlRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return slackWebhookUrlRegex.test(url);
    };

    exports.getSlackWebhookUrl = async () => {
      try {
        const storageConnection = getStorageConnection();
        const config = await storageConnection.getConfig('slackWebhookUrl');
        if (config && config.value && config.value === 'slackWebhookUrl') {
          slackWebhookUrl = config.value;
        } else {
          const id = uuidv4();
          const newConfig = await storageConnection.setConfig('slackWebhookUrl', id);
          newConfig && newConfig.value && newConfig.value === 'slackWebhookUrl' && (slackWebhookUrl = newConfig.value);
        }
        return slackWebhookUrl || false;
      } catch (error) {
        console.error('Error getting Slack webhook URL:', error);
        throw error;
      }
    };

    exports.getSlackWebhookUrl = () => {
      if (slackWebhookUrl) {
        return slackWebhookUrl;
      } else {
        return false;
      }
    };
  }
});

var Jsonapi = require_jsonapiUtil();

var { getStorageConnection } = require_storageConnection();
var helpers = require_helpers();

exports.getLogs = async (req, res) => {
  try {
    const query = req.query || {};
    let logIds;
    if (query.logIds) {
      logIds = query.logIds.split(',');
    }
    query.level && (query.level = parseInt(query.level));
    if (query.hostnames) {
      query.hostnames = query.hostnames.split(',').map(item => item.trim());
    }
    if (query.logLevels) {
      query.logLevels = query.logLevels && JSON.parse(query.logLevels).length === 0 ? [{}] : JSON.parse(query.logLevels);
    }
    query.errsoleLogs && (query.errsoleLogs = query.errsoleLogs && JSON.parse(query.errsoleLogs).length === 0 ? [] : JSON.parse(query.errsoleLogs));
    const storageConnection = getStorageConnection();
    let logs = {};
    if (logIds) {
      logs = await storageConnection.getLogs(logIds, query);
    } else {
      logs = await storageConnection.getLogs(query);
    }
    if (logs && logs.logs) {
      res.send(Jsonapi.serializer.serialize(Jsonapi.ok, logs.logs, logs.meta));
    } else {
      const error = {};
      error.status = 'error';
      error.message = logs && logs.message ? logs.message : 'No logs found';
      const errors = [error];
      const response = {};
      response.errors = errors;
      res.status(404).send(response);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.status = 'error';
    errorObj.message = error && error.message ? error.message : 'Internal server error';
    const errors = [errorObj];
    const response = {};
    response.errors = errors;
    res.status(500).send(response);
  }
};

exports.getLogsTTL = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const config = await storageConnection.getConfig('logTTL');
    if (config && config.value) {
      res.send(Jsonapi.serializer.serialize(Jsonapi.ok, config.value));
    } else {
      const error = {};
      error.status = 'error';
      error.message = config && config.message ? config.message : 'Log TTL not found';
      const errors = [error];
      const response = {};
      response.errors = errors;
      res.status(404).send(response);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.status = 'error';
    errorObj.message = error && error.message ? error.message : 'Internal server error';
    const errors = [errorObj];
    const response = {};
    response.errors = errors;
    res.status(500).send(response);
  }
};

exports.setLogsTTL = async (req, res) => {
  try {
    const { ttl } = helpers.getLogFilterOptions(req.query);
    if (ttl) {
      const storageConnection = getStorageConnection();
      const config = await storageConnection.getConfig('logTTL', ttl);
      if (config && config.value) {
        await storageConnection.setConfig('logTTL', ttl);
        res.send(Jsonapi.serializer.serialize(Jsonapi.ok, config.value));
      } else {
        const error = {};
        error.status = 'error';
        error.message = config && config.message ? config.message : 'Log TTL not found';
        const errors = [error];
        const response = {};
        response.errors = errors;
        res.status(404).send(response);
      }
    } else {
      const error = {};
      error.status = 'error';
      error.message = 'TTL is required';
      const errors = [error];
      const response = {};
      response.errors = errors;
      res.status(400).send(response);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.status = 'error';
    errorObj.message = error && error.message ? error.message : 'Internal server error';
    const errors = [errorObj];
    const response = {};
    response.errors = errors;
    res.status(500).send(response);
  }
};

exports.getLogMeta = async (req, res) => {
  try {
    const logId = req.params.logId;
    if (logId) {
      const storageConnection = getStorageConnection();
      const log = await storageConnection.getLog(logId);
      if (log && log.value) {
        res.send(Jsonapi.serializer.serialize(Jsonapi.ok, log.value));
      } else {
        const error = {};
        error.status = 'error';
        error.message = 'Log not found';
        const errors = [error];
        const response = {};
        response.errors = errors;
        res.status(404).send(response);
      }
    } else {
      const error = {};
      error.status = 'error';
      error.message = 'Log ID is required';
      const errors = [error];
      const response = {};
      response.errors = errors;
      res.status(400).send(response);
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'Log not found') {
      const errorObj = {};
      errorObj.id = logId;
      errorObj.message = '{}';
      res.send(Jsonapi.serializer.serialize(Jsonapi.ok, errorObj));
    } else {
      const errorObj = {};
      errorObj.status = 'error';
      errorObj.message = error && error.message ? error.message : 'Internal server error';
      const errors = [errorObj];
      const response = {};
      response.errors = errors;
      res.status(500).send(response);
    }
  }
};

exports.getLogsTTL = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const config = await storageConnection.getConfig('logTTL');
    if (config && config.value) {
      const response = {};
      response.logTTL = config.value;
      res.send(Jsonapi.serializer.serialize(Jsonapi.ok, response));
    } else {
      const error = {};
      error.status = 'error';
      error.message = config && config.message ? config.message : 'Log TTL not found';
      const errors = [error];
      const response = {};
      response.errors = errors;
      res.status(404).send(response);
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'Log TTL not found') {
      res.send(Jsonapi.serializer.serialize(Jsonapi.ok, {}));
    } else {
      const errorObj = {};
      errorObj.status = 'error';
      errorObj.message = error && error.message ? error.message : 'Internal server error';
      const errors = [errorObj];
      const response = {};
      response.errors = errors;
      res.status(500).send(response);
    }
  }
};

exports.clearLogs = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    await storageConnection.clearLogs();
    const response = {};
    response.status = 'ok';
    res.send(response);
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.status = 'error';
    errorObj.message = error.message || 'Internal server error';
    const errors = [errorObj];
    const response = {};
    response.errors = errors;
    res.status(500).send(response);
  }
};
