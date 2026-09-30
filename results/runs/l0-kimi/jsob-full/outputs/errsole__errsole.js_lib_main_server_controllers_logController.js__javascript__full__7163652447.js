'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(exports, module) {
    'use strict';
    var JSONAPISerializer = require('jsonapi-serializer').Serializer;
    var serializer = new JSONAPISerializer('log', { attributes: [] });
    var Jsonapi = {};
    Jsonapi.type = 'log';
    Jsonapi.serializer = serializer;
    module.exports = Jsonapi;
  }
});

var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(exports, module) {
    'use strict';
    var storageConnection = null;
    function setStorageConnection(connection) {
      if (!storageConnection) {
        storageConnection = connection;
      }
      return storageConnection;
    }
    function getStorageConnection() {
      if (!storageConnection) {
        throw new Error('Storage connection not initialized');
      }
      return storageConnection;
    }
    module.exports = { setStorageConnection, getStorageConnection };
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports) {
    'use strict';
    var { v4: uuidv4 } = require('uuid');
    var { getStorageConnection } = require_storageConnection();
    var slackWebhookRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;

    exports.getTTL = (query) => {
      if (!query || !query.ttl) return {};
      return query.ttl.split(',').map(Number);
    };

    exports.isValidSlackWebhook = (url) => {
      return slackWebhookRegex.test(url);
    };

    exports.getConfig = async () => {
      try {
        const connection = getStorageConnection();
        const result = await connection.getConfig('appName');
        if (result && result.value && result.value === 'errsole') {
          return result.value;
        } else {
          const id = uuidv4();
          const newResult = await connection.setConfig('appName', id);
          if (newResult && newResult.value && newResult.value === 'errsole') {
            return newResult.value;
          }
        }
        return false;
      } catch (err) {
        console.error('Error getting config:', err);
        throw err;
      }
    };

    exports.getAppName = () => {
      if (typeof window !== 'undefined' && window.__errsoleAppName) {
        return window.__errsoleAppName;
      }
      return false;
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
    if (query.log_ids) {
      logIds = query.log_ids.split(',');
    }
    if (query.limit) {
      query.limit = parseInt(query.limit);
    }
    if (query.levels) {
      query.levels = query.levels.split(',').map(l => l.trim());
    }
    if (query.filters) {
      query.filters = JSON.parse(query.filters).length === 0 ? [{}] : JSON.parse(query.filters);
    }
    if (query.hostnames) {
      query.hostnames = query.hostnames.split(',').map(h => h.trim());
    }
    const connection = getStorageConnection();
    let logs = {};
    if (logIds) {
      logs = await connection.getLogs(logIds, query);
    } else {
      logs = await connection.getLogs(query);
    }
    if (logs && logs.data) {
      res.json(Jsonapi.serializer.serialize(Jsonapi.type, logs.data, logs.meta));
    } else {
      const errorObj = { title: 'No logs found', detail: logs && logs.error ? logs.error : 'No logs found' };
      const errors = [errorObj];
      res.status(404).json({ errors });
    }
  } catch (err) {
    console.error(err);
    const errorObj = { title: 'Error fetching logs', detail: err && err.message ? err.message : 'Error fetching logs' };
    const errors = [errorObj];
    res.status(500).json({ errors });
  }
};

exports.getLogById = async (req, res) => {
  try {
    const connection = getStorageConnection();
    const result = await connection.getLogById(req.params.id);
    if (result && result.data) {
      res.json(Jsonapi.serializer.serialize(Jsonapi.type, result.data));
    } else {
      const errorObj = { title: 'Log not found', detail: result && result.error ? result.error : 'Log not found' };
      const errors = [errorObj];
      res.status(404).json({ errors });
    }
  } catch (err) {
    console.error(err);
    const errorObj = { title: 'Error fetching log', detail: err && err.message ? err.message : 'Error fetching log' };
    const errors = [errorObj];
    res.status(500).json({ errors });
  }
};

exports.deleteOldLogs = async (req, res) => {
  try {
    const { ttl } = helpers.getTTL(req.body);
    if (ttl) {
      const connection = getStorageConnection();
      const result = await connection.deleteOldLogs('logs', ttl);
      if (result && result.data) {
        res.json(Jsonapi.serializer.serialize(Jsonapi.type, result.data));
      } else {
        const errorObj = { title: 'Error deleting logs', detail: result && result.error ? result.error : 'Error deleting logs' };
        const errors = [errorObj];
        res.status(500).json({ errors });
      }
    } else {
      const errorObj = { title: 'Invalid TTL', detail: 'TTL is required' };
      const errors = [errorObj];
      res.status(400).json({ errors });
    }
  } catch (err) {
    console.error(err);
    const errorObj = { title: 'Error deleting logs', detail: err && err.message ? err.message : 'Error deleting logs' };
    const errors = [errorObj];
    res.status(500).json({ errors });
  }
};

exports.getLogStats = async (req, res) => {
  const logId = req.params.logId;
  try {
    if (logId) {
      const connection = getStorageConnection();
      const result = await connection.getLogStats(logId);
      if (result && result.data) {
        res.json(Jsonapi.serializer.serialize(Jsonapi.type, result.data));
      } else {
        const errorObj = { title: 'Log stats not found', detail: 'Log stats not found' };
        const errors = [errorObj];
        res.status(404).json({ errors });
      }
    } else {
      const errorObj = { title: 'Log ID required', detail: 'Log ID is required' };
      const errors = [errorObj];
      res.status(400).json({ errors });
    }
  } catch (err) {
    console.error(err);
    if (err.code === 'ENOENT') {
      const data = { id: logId, attributes: '{}' };
      res.json(Jsonapi.serializer.serialize(Jsonapi.type, data));
    } else {
      const errorObj = { title: 'Error fetching log stats', detail: err && err.message ? err.message : 'Error fetching log stats' };
      const errors = [errorObj];
      res.status(500).json({ errors });
    }
  }
};

exports.getLogLevels = async (req, res) => {
  try {
    const connection = getStorageConnection();
    const result = await connection.getLogLevels();
    if (result && result.data) {
      const data = { levels: result.data };
      res.json(Jsonapi.serializer.serialize(Jsonapi.type, data));
    } else {
      const errorObj = { title: 'Error fetching log levels', detail: result && result.error ? result.error : 'Error fetching log levels' };
      const errors = [errorObj];
      res.status(500).json({ errors });
    }
  } catch (err) {
    console.error(err);
    if (err.code === 'ENOENT') {
      res.json(Jsonapi.serializer.serialize(Jsonapi.type, {}));
    } else {
      const errorObj = { title: 'Error fetching log levels', detail: err && err.message ? err.message : 'Error fetching log levels' };
      const errors = [errorObj];
      res.status(500).json({ errors });
    }
  }
};

exports.clearLogs = async (req, res) => {
  try {
    const connection = getStorageConnection();
    await connection.clearLogs();
    const response = { message: 'Logs cleared successfully' };
    res.json(response);
  } catch (err) {
    console.error(err);
    const errorObj = { title: 'Error clearing logs', detail: err.message || 'Error clearing logs' };
    const errors = [errorObj];
    res.status(500).json({ errors });
  }
};
