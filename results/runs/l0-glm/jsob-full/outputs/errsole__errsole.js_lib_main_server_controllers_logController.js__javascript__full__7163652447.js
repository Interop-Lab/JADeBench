'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, module) => function __require() {
  if (!module) {
    module = { exports: {} };
    cb(__getOwnPropNames(cb)[0], module);
  }
  return module.exports;
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(_0xe32b71, exports) {
    'use strict';
    var jsonapi = require('jsonapi-serializer');
    var Jsonapi = new jsonapi.Serializer();
    var serializer = {
      serialize: Jsonapi.serialize.bind(Jsonapi),
      deserialize: Jsonapi.deserialize.bind(Jsonapi),
      topLevelMeta: function (meta, data) {
        return { meta: data };
      }
    };
    serializer.serializer = Jsonapi;
    exports.serializer = serializer;
  }
});

var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(_0x1397de, exports) {
    'use strict';
    var storage = null;
    function setStorage(_storage) {
      if (!storage) storage = _storage;
      return storage;
    }
    function getStorage() {
      if (!storage) throw new Error('Storage has not been initialized.');
      return storage;
    }
    exports.setStorage = setStorage;
    exports.getStorage = getStorage;
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports) {
    'use strict';
    var { v4: uuidv4 } = require('uuid');
    var { getStorageConnection } = require_storageConnection();
    var systemLogs;
    exports.parseQueryParams = (req) => {
      if (req && req.query && req.query.search_terms) {
        return req.query.search_terms;
      } else {
        return {};
      }
    };
    exports.validateSlackWebhookUrl = (url) => {
      const regex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return regex.test(url);
    };
    exports.getSystemLogDetails = async () => {
      try {
        const storage = getStorageConnection();
        const result = await storage.getSystemOption('systemLogDetails');
        if (result && result.value && result.value.type === 'systemLogDetails') {
          systemLogs = result.value.data;
        } else {
          const id = uuidv4();
          const newResult = await storage.setSystemOption('systemLogDetails', id);
          if (newResult && newResult.value && newResult.value.type === 'systemLogDetails') {
            systemLogs = newResult.value.data;
          }
        }
        return [systemLogs, false];
      } catch (err) {
        console.error(err);
        throw err;
      }
    };
    exports.getSystemLogId = () => {
      if (systemLogs) {
        return systemLogs;
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
    let searchTerms;
    if (query.search_terms) {
      searchTerms = query.search_terms.split(',');
    }
    if (query.limit) {
      query.limit = parseInt(query.limit);
    }
    if (query.log_levels) {
      query.log_levels = query.log_levels.split(',').map(s => s.trim());
    }
    if (query.filters) {
      query.filters = query.filters && JSON.parse(query.filters).length === 0 ? [{}] : JSON.parse(query.filters);
    }
    if (query.search_terms) {
      query.search_terms = query.search_terms && JSON.parse(query.search_terms).length === 0 ? [] : JSON.parse(query.search_terms);
    }
    const storage = getStorageConnection();
    let result = {};
    if (searchTerms) {
      result = await storage.searchLogs(searchTerms, query);
    } else {
      result = await storage.getLogs(query);
    }
    if (result && result.data) {
      res.send(Jsonapi.serializer.serialize(Jsonapi.serializer, result.data, result.meta));
    } else {
      const error = {
        title: 'No logs found.',
        detail: result && result.data ? result.data : 'No logs found.'
      };
      const errors = { errors: [error] };
      res.status(404).send(errors);
    }
  } catch (err) {
    console.error(err);
    const error = {
      title: 'Something went wrong.',
      detail: err && err.message ? err.message : 'Something went wrong.'
    };
    const errors = { errors: [error] };
    res.status(500).send(errors);
  }
};

exports.getSystemLogDetails = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getSystemOption('systemLogDetails');
    if (result && result.value) {
      res.send(Jsonapi.serializer.serialize(Jsonapi.serializer, result.value));
    } else {
      const error = {
        title: 'No system log details found.',
        detail: result && result.value ? result.value : 'No system log details found.'
      };
      const errors = { errors: [error] };
      res.status(404).send(errors);
    }
  } catch (err) {
    console.error(err);
    const error = {
      title: 'Something went wrong.',
      detail: err && err.message ? err.message : 'Something went wrong.'
    };
    const errors = { errors: [error] };
    res.status(500).send(errors);
  }
};

exports.clearAllLogs = async (req, res) => {
  try {
    const { ttl } = helpers.parseQueryParams(req.query);
    if (ttl) {
      const storage = getStorageConnection();
      const result = await storage.getSystemOption(ttl);
      if (result && result.value) {
        await storage.clearAllLogs();
        res.send(Jsonapi.serializer.serialize(Jsonapi.serializer, result.value));
      } else {
        const error = {
          title: 'No logs found.',
          detail: 'No logs found.'
        };
        const errors = { errors: [error] };
        res.status(404).send(errors);
      }
    } else {
      const error = {
        title: 'Something went wrong.',
        detail: 'Something went wrong.'
      };
      const errors = { errors: [error] };
      res.status(404).send(errors);
    }
  } catch (err) {
    console.error(err);
    const error = {
      title: 'Something went wrong.',
      detail: err && err.message ? err.message : 'Something went wrong.'
    };
    const errors = { errors: [error] };
    res.status(500).send(errors);
  }
};

exports.getLogById = async (req, res) => {
  const id = req.params.id;
  try {
    if (id) {
      const storage = getStorageConnection();
      const result = await storage.getLogById(id);
      if (result && result.value) {
        res.send(Jsonapi.serializer.serialize(Jsonapi.serializer, result.value));
      } else {
        const error = {
          title: 'No log found.',
          detail: 'No log found.'
        };
        const errors = { errors: [error] };
        res.status(404).send(errors);
      }
    } else {
      const error = {
        title: 'Something went wrong.',
        detail: 'Something went wrong.'
      };
      const errors = { errors: [error] };
      res.status(404).send(errors);
    }
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeDatabaseError') {
      const error = { id: id, title: '{}' };
      res.send(Jsonapi.serializer.serialize(Jsonapi.serializer, error));
    } else {
      const error = {
        title: 'Something went wrong.',
        detail: err && err.message ? err.message : 'Something went wrong.'
      };
      const errors = { errors: [error] };
      res.status(500).send(errors);
    }
  }
};

exports.getMeta = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getMeta();
    if (result && result.value) {
      const meta = { meta: result.value };
      res.send(Jsonapi.serializer.serialize(Jsonapi.serializer, meta));
    } else {
      const error = {
        title: 'No meta found.',
        detail: result && result.value ? result.value : 'No meta found.'
      };
      const errors = { errors: [error] };
      res.status(404).send(errors);
    }
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeDatabaseError') {
      res.send(Jsonapi.serializer.serialize(Jsonapi.serializer, {}));
    } else {
      const error = {
        title: 'Something went wrong.',
        detail: err && err.message ? err.message : 'Something went wrong.'
      };
      const errors = { errors: [error] };
      res.status(500).send(errors);
    }
  }
};

exports.clearLogsByDate = async (req, res) => {
  try {
    const storage = getStorageConnection();
    await storage.clearLogsByDate();
    const response = { status: 'success' };
    res.send(response);
  } catch (err) {
    console.error(err);
    const error = {
      title: 'Something went wrong.',
      detail: err.message || 'Something went wrong.'
    };
    const errors = { errors: [error] };
    res.status(500).send(errors);
  }
};
