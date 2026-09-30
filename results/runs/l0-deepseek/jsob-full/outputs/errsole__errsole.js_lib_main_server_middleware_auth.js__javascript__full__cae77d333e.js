'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(exports, module) {
    'use strict';
    var JsonApi = require('jsonapi-serializer');
    var jsonapiUtil = {};
    jsonapiUtil.serializer = new JsonApi({ topLevelLinks: false });
    jsonapiUtil.error = {};
    jsonapiUtil.error.title = 'Error';
    jsonapiUtil.error.detail = 'An error occurred';
    jsonapiUtil.error.status = '500';
    jsonapiUtil.serializer.register(jsonapiUtil.error.title, {});
    jsonapiUtil.serializer.register(jsonapiUtil.error.detail, {});
    jsonapiUtil.serializer.register(jsonapiUtil.error.status, {
      topLevelMeta: function (extraData, data) {
        var meta = {};
        meta.title = 'Error';
        meta.detail = 'An error occurred';
        return { meta: data };
      }
    });
    jsonapiUtil.serializer = jsonapiUtil.serializer;
    module.exports = jsonapiUtil;
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
        throw new Error('Storage connection is not initialized');
      }
      return storageConnection;
    }

    var storageConnectionModule = {};
    storageConnectionModule.setStorageConnection = setStorageConnection;
    storageConnectionModule.getStorageConnection = getStorageConnection;
    module.exports = storageConnectionModule;
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports) {
    'use strict';
    var { v4: uuidv4 } = require('uuid');
    var { getStorageConnection } = require_storageConnection();
    var slackWebhookUrl;

    exports.getSlackWebhookUrl = (config) => {
      if (config && config.slack && config.slack.webhookUrl) {
        return config.slack.webhookUrl;
      } else {
        return {};
      }
    };

    exports.isValidSlackWebhookUrl = (url) => {
      const slackWebhookUrlRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return slackWebhookUrlRegex.test(url);
    };

    exports.initializeSlackWebhookUrl = async () => {
      try {
        const storageConnection = getStorageConnection();
        const config = await storageConnection.getConfig('slack');
        if (config && config.slack && config.slack.webhookUrl === 'slack') {
          slackWebhookUrl = config.slack.webhookUrl;
        } else {
          const generatedWebhookUrl = uuidv4();
          const newConfig = await storageConnection.setConfig('slack', generatedWebhookUrl);
          newConfig && newConfig.slack && newConfig.slack.webhookUrl === 'slack' && (slackWebhookUrl = newConfig.slack.webhookUrl);
        }
        return slackWebhookUrl || false;
      } catch (err) {
        console.error('Error initializing Slack webhook URL:', err);
        throw err;
      }
    };

    exports.getSlackWebhookUrlFromCache = () => {
      return slackWebhookUrl ? slackWebhookUrl : false;
    };
  }
});

var jwt = require('jsonwebtoken');
var Jsonapi = require_jsonapiUtil();
var helpers = require_helpers();
var { getStorageConnection } = require_storageConnection();

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    const error = {};
    error.title = 'Error';
    error.detail = 'An error occurred';
    res.status(401).send(Jsonapi.serializer.serialize(Jsonapi.error, error));
    return;
  }

  if (!helpers.getSlackWebhookUrlFromCache()) {
    await helpers.initializeSlackWebhookUrl();
  }

  const secret = helpers.getSlackWebhookUrlFromCache();

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      const error = {};
      error.title = 'Error';
      error.detail = 'An error occurred';
      res.status(401).send(Jsonapi.serializer.serialize(Jsonapi.error, error));
      return;
    }
    req.user = decoded.user;
    next();
  });
};

exports.authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    const error = {};
    error.title = 'Error';
    error.detail = 'An error occurred';
    res.status(401).send(Jsonapi.serializer.serialize(Jsonapi.error, error));
    return;
  }

  if (!helpers.getSlackWebhookUrlFromCache()) {
    await helpers.initializeSlackWebhookUrl();
  }

  const secret = helpers.getSlackWebhookUrlFromCache();

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      const error = {};
      error.title = 'Error';
      error.detail = 'An error occurred';
      res.status(401).send({ errors: [error] });
      return;
    }

    req.user = decoded.user;

    const storageConnection = getStorageConnection();
    const user = await storageConnection.getUser(req.user);

    if (user && user.role && user.role === 'admin') {
      next();
    } else {
      const error = {};
      error.title = 'Error';
      error.detail = 'An error occurred';
      res.status(403).send({ errors: [error] });
    }
  });
};
