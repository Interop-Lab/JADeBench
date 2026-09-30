'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, module) => () => (module && module.__esModule || (module = { exports: {} }), cb(module, module.exports), module.exports);

var require_jsonapiUtil = __commonJS({ '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(exports, module) {
  'use strict';
  // jsonapiUtil module - provides JSON:API serialization
  // (implementation details elided - provides Serializer and AppType)
}});

var require_npmUpdates = __commonJS({ '../work/errsole__errsole.js/lib/main/server/utils/npmUpdates.js'(exports, module) {
  'use strict';
  // npmUpdates module - provides fetchLatestVersion
}});

var require_storageConnection = __commonJS({ '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(exports, module) {
  'use strict';
  // storageConnection module - provides getStorageConnection
}});

var require_package = __commonJS({ '../work/errsole__errsole.js/package.json'(exports, module) {
  'use strict';
  module.exports = { name: 'errsole', version: '4.0.0' };
}});

var require_helpers = __commonJS({ '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports, module) {
  'use strict';
  // helpers module - provides extractAttributes, validateSlackUrl
}});

var require_alerts = __commonJS({ '../work/errsole__errsole.js/lib/main/server/utils/alerts.js'(exports, module) {
  'use strict';
  // alerts module - provides testSlackAlert, testEmailAlert, clearEmailTransport
}});

var Jsonapi = require_jsonapiUtil();
var NPMUpdates = require_npmUpdates();
var { getStorageConnection } = require_storageConnection();
var packageJson = require_package();
var helpers = require_helpers();
var Alerts = require_alerts();

exports.checkUpdates = async (req, res) => {
  try {
    const latestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storageConnection = getStorageConnection();
    const storageLatestVersion = await NPMUpdates.fetchLatestVersion(storageConnection.name);
    const data = {
      name: packageJson.name,
      version: packageJson.version,
      latest_version: latestVersion,
      storage_name: storageConnection.name,
      storage_version: storageConnection.version,
      storage_latest_version: storageLatestVersion,
      storage_dialect: storageConnection.dialect
    };
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, data));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.getSlackDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const slackDetails = await storageConnection.getConfig('slackIntegration');
    if (slackDetails && slackDetails.item) {
      slackDetails.item.value = JSON.parse(slackDetails.item.value);
      delete slackDetails.item.value.password;
    }
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, slackDetails.item || {}));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.addSlackDetails = async (req, res) => {
  try {
    const { url } = helpers.extractAttributes(req.body);
    const isValidSlackUrl = await helpers.validateSlackUrl(url);
    if (!isValidSlackUrl) {
      const errors = [{
        error: 'Conflict',
        message: 'You have sent a url which is not a slack url.'
      }];
      return res.status(409).send({ errors });
    } else {
      const storageConnection = getStorageConnection();
      const existingSlackDetails = await storageConnection.getConfig('slackIntegration');
      if (existingSlackDetails && !existingSlackDetails.item) {
        const slackConfig = {
          url: url,
          username: 'Errsole',
          icon_url: 'https://avatars.githubusercontent.com/u/84983840',
          status: true
        };
        const newSlackDetails = await storageConnection.setConfig('slackIntegration', JSON.stringify(slackConfig));
        if (newSlackDetails && newSlackDetails.item) {
          newSlackDetails.item.value = JSON.parse(newSlackDetails.item.value);
          res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, newSlackDetails.item));
        } else {
          res.status(500).send({
            errors: [{
              error: 'Internal Server Error',
              message: 'An unexpected error occurred'
            }]
          });
        }
      } else {
        const errors = [{
          error: 'Conflict',
          message: 'You have already added a webhook url for slack.'
        }];
        res.status(409).send({ errors });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.updateSlackDetails = async (req, res) => {
  try {
    const { status } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const slackDetails = await storageConnection.getConfig('slackIntegration');
    if (slackDetails && slackDetails.item) {
      let slackConfig;
      try {
        slackConfig = JSON.parse(slackDetails.item.value);
        slackConfig.status = JSON.parse(status);
      } catch (err) {
        console.error(err);
        res.status(500).send({
          errors: [{
            error: 'Internal Server Error',
            message: err && err.message ? err.message : 'An unexpected error occurred'
          }]
        });
      }
      slackDetails.item.value.status = JSON.parse(status);
      const updatedSlackDetails = await storageConnection.setConfig('slackIntegration', JSON.stringify(slackConfig));
      if (updatedSlackDetails && updatedSlackDetails.item) {
        updatedSlackDetails.item.value = JSON.parse(updatedSlackDetails.item.value);
        res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, updatedSlackDetails.item));
      } else {
        res.status(500).send({
          errors: [{
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }]
        });
      }
    } else {
      res.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.deleteSlackDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const deleted = await storageConnection.deleteConfig('slackIntegration');
    if (deleted) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, { data: 'slack integration has been removed' }));
    } else {
      res.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.getEmailDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const emailDetails = await storageConnection.getConfig('emailIntegration');
    if (emailDetails && emailDetails.item) {
      emailDetails.item.value = JSON.parse(emailDetails.item.value);
      delete emailDetails.item.value.password;
    }
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, emailDetails.item || {}));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.addEmailDetails = async (req, res) => {
  try {
    const { sender, host, port, username, password, receivers } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const emailConfig = {
      sender: sender,
      host: host,
      port: port,
      username: username,
      password: password,
      receivers: receivers,
      status: true
    };
    const newEmailDetails = await storageConnection.setConfig('emailIntegration', JSON.stringify(emailConfig));
    if (newEmailDetails && newEmailDetails.item) {
      newEmailDetails.item.value = JSON.parse(newEmailDetails.item.value);
      await Alerts.clearEmailTransport();
      res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, newEmailDetails.item));
    } else {
      res.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.updateEmailDetails = async (req, res) => {
  try {
    const { status } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const emailDetails = await storageConnection.getConfig('emailIntegration');
    if (emailDetails && emailDetails.item) {
      let emailConfig;
      try {
        emailConfig = JSON.parse(emailDetails.item.value);
        emailConfig.status = JSON.parse(status);
      } catch (err) {
        console.error(err);
        res.status(500).send({
          errors: [{
            error: 'Internal Server Error',
            message: err && err.message ? err.message : 'An unexpected error occurred'
          }]
        });
      }
      emailDetails.item.value.status = JSON.parse(status);
      const updatedEmailDetails = await storageConnection.setConfig('emailIntegration', JSON.stringify(emailConfig));
      if (updatedEmailDetails && updatedEmailDetails.item) {
        updatedEmailDetails.item.value = JSON.parse(updatedEmailDetails.item.value);
        await Alerts.clearEmailTransport();
        res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, updatedEmailDetails.item));
      } else {
        res.status(500).send({
          errors: [{
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }]
        });
      }
    } else {
      res.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.deleteEmailDetails = async (req, res) => {
  try {
    const { url } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const deleted = await storageConnection.deleteConfig('emailIntegration');
    if (deleted) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, { url: url }));
    } else {
      res.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.testSlackNotification = async (req, res) => {
  try {
    const success = await Alerts.testSlackAlert('This is a test notification from the Errsole Logger.', 'Test Notification');
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, { success: success }));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.testEmailNotification = async (req, res) => {
  try {
    const success = await Alerts.testEmailAlert('This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.', 'Test Notification');
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, { success: success }));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.getAlertUrlDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const alertUrlDetails = await storageConnection.getConfig('alertUrl');
    if (alertUrlDetails && alertUrlDetails.item) {
      alertUrlDetails.item.value = JSON.parse(alertUrlDetails.item.value);
    }
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, alertUrlDetails.item || {}));
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.addAlertUrlDetails = async (req, res) => {
  try {
    const { url } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const alertUrlConfig = { url: url };
    const newAlertUrlDetails = await storageConnection.setConfig('alertUrl', JSON.stringify(alertUrlConfig));
    if (newAlertUrlDetails && newAlertUrlDetails.item) {
      newAlertUrlDetails.item.value = JSON.parse(newAlertUrlDetails.item.value);
      res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, newAlertUrlDetails.item));
    } else {
      res.status(500).send({
        errors: [{
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: err && err.message ? err.message : 'An unexpected error occurred'
      }]
    });
  }
};
