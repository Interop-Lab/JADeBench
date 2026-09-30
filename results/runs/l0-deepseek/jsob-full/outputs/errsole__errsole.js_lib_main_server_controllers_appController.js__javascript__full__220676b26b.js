'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(exports, module) {
    'use strict';
    var JsonapiSerializer = require('jsonapi-serializer');
    var jsonapiUtil = {};
    jsonapiUtil.serializer = new JsonapiSerializer({ topLevelLinks: false });
    jsonapiUtil.serializer.register(jsonapiUtil.error, {});
    jsonapiUtil.serializer.register(jsonapiUtil.success, {});
    jsonapiUtil.error = function (title, detail) {
      return { title: detail };
    };
    jsonapiUtil.success = 'success';
    module.exports = jsonapiUtil;
  }
});

var require_npmUpdates = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/npmUpdates.js'(exports, module) {
    'use strict';
    var axios = require('axios');
    var npmUpdates = {};
    npmUpdates.checkForUpdates = async function (packageName) {
      const requestConfig = {
        method: 'get',
        url: 'https://registry.npmjs.org/' + packageName + '/latest'
      };
      const response = await axios(requestConfig);
      if (response.status === 200 && response.data) {
        if (response.data.version) {
          return response.data.version;
        } else {
          return null;
        }
      } else {
        throw new Error('Failed to check for updates');
      }
    };
    module.exports = npmUpdates;
  }
});

var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(exports, module) {
    'use strict';
    var storageConnection = null;
    function setStorageConnection(connection) {
      return !storageConnection && (storageConnection = connection), storageConnection;
    }
    function getStorageConnection() {
      if (!storageConnection) throw new Error('Storage connection is not initialized');
      return storageConnection;
    }
    const storageConnectionModule = {};
    storageConnectionModule.setStorageConnection = setStorageConnection;
    storageConnectionModule.getStorageConnection = getStorageConnection;
    module.exports = storageConnectionModule;
  }
});

var require_package = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/package.js'(module) {
    'use strict';
    const packageData = {
      name: 'errsole',
      version: '1.0.0',
      description: 'A logging and alerting library',
      main: 'index.js',
      scripts: {},
      keywords: [],
      author: '',
      license: 'MIT',
      dependencies: {},
      devDependencies: {}
    };
    packageData.dependencies = {
      'jsonapi-serializer': '^3.6.7',
      'axios': '^0.21.1',
      'nodemailer': '^6.6.3',
      'slack': '^1.2.0'
    };
    packageData.devDependencies = {
      'jest': '^27.0.6',
      'eslint': '^7.32.0',
      'prettier': '^2.3.2'
    };
    module.exports = packageData;
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports) {
    'use strict';
    var { v4: uuidv4 } = require('uuid');
    var { getStorageConnection } = require_storageConnection();
    var notificationId;
    exports.getNotificationConfig = (config) => {
      return config && config.notifications && config.notifications.slack ? config.notifications.slack : {};
    };
    exports.isValidSlackWebhookUrl = (url) => {
      const slackWebhookUrlPattern = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return slackWebhookUrlPattern.test(url);
    };
    exports.getNotificationId = async () => {
      try {
        const storageConnection = getStorageConnection();
        const existingNotification = await storageConnection.getConfig('notificationId');
        if (existingNotification && existingNotification.value && existingNotification.value.value === 'notificationId') {
          notificationId = existingNotification.value.value;
        } else {
          const newNotificationId = uuidv4();
          const savedNotification = await storageConnection.setConfig('notificationId', newNotificationId);
          savedNotification && savedNotification.value && savedNotification.value.value === 'notificationId' && (notificationId = savedNotification.value.value);
        }
        return notificationId || false;
      } catch (err) {
        console.error('Error getting notification id', err);
        throw err;
      }
    };
    exports.getNotificationIdSync = () => {
      return notificationId ? notificationId : false;
    };
  }
});

var require_alerts = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/alerts.js'(exports) {
    'use strict';
    var { getStorageConnection } = require_storageConnection();
    var nodemailer = require('nodemailer');
    var slack = require('slack');
    var crypto = require('crypto');

    exports.sendAlert = async function (alertType, alertData, notificationConfig, notificationId) {
      try {
        const { isDuplicateAlert, todayCount } = await checkDuplicateAlert(alertType, alertData, notificationConfig);
        if (isDuplicateAlert) return false;
        return await emailAlerts.sendAlert(alertType, 'email', alertData, notificationConfig, todayCount, notificationId),
          await slackAlerts.sendAlert(alertType, 'slack', alertData, notificationConfig, todayCount, notificationId),
          true;
      } catch (err) {
        return console.error('Error sending alert', err), false;
      }
    };

    exports.sendTestAlert = async function (alertType, alertData, notificationConfig, notificationId) {
      try {
        const { isDuplicateAlert, todayCount } = await checkDuplicateAlert(alertType, alertData, notificationConfig);
        if (isDuplicateAlert) return false;
        return await emailAlerts.sendAlert(alertType, 'email', alertData, notificationConfig, todayCount, notificationId),
          await slackAlerts.sendAlert(alertType, 'slack', alertData, notificationConfig, todayCount, notificationId),
          true;
      } catch (err) {
        return console.error('Error sending test alert', err), false;
      }
    };

    exports.sendEmailAlert = async function (alertType, notificationConfig) {
      try {
        const emailAlert = await emailAlerts.sendAlert(alertType, 'email', notificationConfig);
        return emailAlert;
      } catch (err) {
        return console.error('Error sending email alert', err), false;
      }
    };

    exports.sendSlackAlert = async function (alertType, notificationConfig) {
      try {
        const slackAlert = await slackAlerts.sendAlert(alertType, 'slack', notificationConfig);
        return slackAlert;
      } catch (err) {
        return console.error('Error sending slack alert', err), false;
      }
    };

    exports.sendEmailTestAlert = async function (alertType, notificationConfig) {
      try {
        const emailAlert = await emailAlerts.sendAlert(alertType, 'email', notificationConfig);
        return emailAlert;
      } catch (err) {
        return console.error('Error sending email test alert', err), false;
      }
    };

    exports.sendSlackTestAlert = async function (alertType, notificationConfig) {
      try {
        const slackAlert = await slackAlerts.sendAlert(alertType, 'slack', notificationConfig);
        return slackAlert;
      } catch (err) {
        return console.error('Error sending slack test alert', err), false;
      }
    };

    var emailAlerts = {};
    emailAlerts.sendAlert = async function (alertType, channel, alertData, notificationConfig, todayCount, notificationId) {
      try {
        const storageConnection = getStorageConnection();
        const emailConfig = await storageConnection.getConfig('email');
        if (emailConfig && emailConfig.value) {
          const emailConfigData = JSON.parse(emailConfig.value.value);
          if (!emailConfigData.enabled) {
            return false;
          }
          const notificationConfigData = await storageConnection.getConfig('notificationId');
          let notificationIdValue;
          if (notificationConfigData && notificationConfigData.value && notificationConfig) {
            const notificationData = JSON.parse(notificationConfigData.value.value);
            let notificationDate;
            if (!notificationId) {
              notificationDate = new Date(new Date().getTime() - 86400000).toISOString();
            } else {
              notificationDate = parseDate(notificationId);
              notificationDate = notificationDate.toISOString();
            }
            notificationIdValue = notificationData.id + ':' + notificationConfig + ':' + notificationDate;
          }
          const emailAddress = emailConfigData.email;
          const emailMessage = buildEmailMessage(alertType, alertData, notificationConfig, notificationIdValue, todayCount);
          emailMessage.from = emailConfigData.from || 'errsole';
          emailMessage.to = emailConfigData.to || 'admin';
          const transporter = nodemailer.createTransport(emailAddress, emailMessage);
          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Email sending timeout'));
            }, 10000);
          });
          try {
            await Promise.race([transporter, timeoutPromise]);
          } catch (err) {
            return false;
          }
          return true;
        }
        return false;
      } catch (err) {
        return console.error('Error sending email alert', err), false;
      }
    };

    function buildEmailMessage(alertType, alertData, notificationConfig = {}, notificationIdValue, todayCount) {
      const blocks = { blocks: [] };
      blocks.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*' + alertData + '*'
        }
      });
      if (notificationConfig.title) {
        const titleBlock = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: notificationConfig.title
          }
        };
        blocks.blocks.push(titleBlock);
      }
      if (notificationConfig.description) {
        const descriptionBlock = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: notificationConfig.description
          }
        };
        blocks.blocks.push(descriptionBlock);
      }
      if (notificationConfig.time) {
        const timeBlock = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: notificationConfig.time
          }
        };
        blocks.blocks.push(timeBlock);
      }
      const alertBlock = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alertType
        }
      };
      blocks.blocks.push(alertBlock);
      if (todayCount) {
        if (alertData === 'error') {
          blocks.blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Error count: ' + todayCount + (todayCount > 1 ? 's' : '') + '*'
            }
          });
        } else {
          blocks.blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Alert count: ' + todayCount + (todayCount > 1 ? 's' : '') + '*'
            }
          });
        }
      }
      if (notificationIdValue) {
        blocks.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '<' + notificationIdValue + '>'
          }
        });
      }
      if (alertData === 'error') {
        const errorBlock = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Error*'
          }
        };
        blocks.blocks.push(errorBlock);
      } else if (alertData === 'warning') {
        const warningBlock = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Warning*'
          }
        };
        blocks.blocks.push(warningBlock);
      }
      const dividerBlock = {
        type: 'divider'
      };
      blocks.blocks.push(dividerBlock);
      return blocks;
    }

    var slackAlerts = {};
    slackAlerts.sendAlert = async function (alertType, channel, alertData, notificationConfig, todayCount, notificationId) {
      try {
        await slackAlerts.initialize();
        if (this.slackClient === null) {
          return false;
        }
        const storageConnection = getStorageConnection();
        const slackConfig = await storageConnection.getConfig('slack');
        if (slackConfig && slackConfig.value) {
          const slackConfigData = JSON.parse(slackConfig.value.value);
          if (!slackConfigData.enabled) {
            return false;
          }
          const notificationConfigData = await storageConnection.getConfig('notificationId');
          let notificationIdValue;
          if (notificationConfigData && notificationConfigData.value && notificationConfig) {
            const notificationData = JSON.parse(notificationConfigData.value.value);
            let notificationDate;
            if (!notificationId) {
              notificationDate = new Date(new Date().getTime() - 86400000).toISOString();
            } else {
              notificationDate = parseDate(notificationId);
              notificationDate = notificationDate.toISOString();
            }
            notificationIdValue = notificationData.id + ':' + notificationConfig + ':' + notificationDate;
          }
          let alertTitle, alertMessage = '';
          if (alertData.title && alertData.description) {
            alertTitle = 'Error: ' + alertData + ' (' + alertData.title + ' - ' + alertData.description + ')';
            alertMessage = 'Error: ' + alertData + ' (' + alertData.title + ' - ' + alertData.description + ')';
          } else if (alertData.title) {
            alertTitle = 'Error: ' + alertData + ' (' + alertData.title + ')';
            alertMessage = 'Error: ' + alertData + ' (' + alertData.title + ')';
          } else if (alertData.description) {
            alertTitle = 'Error: ' + alertData + ' (' + alertData.description + ')';
            alertMessage = 'Error: ' + alertData + ' (' + alertData.description + ')';
          } else {
            alertTitle = 'Error: ' + alertData;
          }
          if (alertData.time) {
            alertMessage += ' Time: ' + alertData.time;
          }
          alertType = alertMessage + ' ' + alertType;
          if (todayCount) {
            if (alertData === 'error') {
              alertType = alertType + ' Error count: ' + todayCount + (todayCount > 1 ? 's' : '');
            } else {
              alertType = alertType + ' Alert count: ' + todayCount + (todayCount > 1 ? 's' : '');
            }
          }
          if (notificationIdValue) {
            alertType = alertType + ' Notification ID: ' + notificationIdValue;
          }
          if (alertData === 'error') {
            alertType = alertType + ' Error';
          } else {
            alertType = alertType + ' Alert';
          }
          const message = {
            channel: slackConfigData.channel,
            to: slackConfigData.to,
            title: alertTitle,
            text: alertType
          };
          const slackMessage = this.slackClient.chat.postMessage(message);
          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Slack sending timeout'));
            }, 10000);
          });
          try {
            await Promise.race([slackMessage, timeoutPromise]);
          } catch (err) {
            return console.error(err), false;
          }
          return true;
        }
        return false;
      } catch (err) {
        return console.error('Error sending slack alert', err), false;
      }
    };

    slackAlerts.initialize = async function () {
      try {
        if (this.slackClient === null) {
          const storageConnection = getStorageConnection();
          const slackConfig = await storageConnection.getConfig('slack');
          if (slackConfig && slackConfig.value) {
            const slackConfigData = JSON.parse(slackConfig.value.value);
            this.slackClient = slack.createTransport({
              pool: true,
              maxConnections: 5,
              maxMessages: 100,
              rateLimit: 10,
              host: slackConfigData.host,
              port: parseInt(slackConfigData.port),
              secure: parseInt(slackConfigData.secure) === 1,
              auth: {
                user: slackConfigData.user,
                pass: slackConfigData.pass
              }
            });
          }
        }
      } catch (err) {
        console.error('Error initializing slack client', err);
        this.slackClient = null;
      }
    };

    slackAlerts.reset = async function () {
      return slackAlerts.slackClient = null, true;
    };

    var checkDuplicateAlert = async (alertType, alertData, notificationConfig) => {
      let isDuplicateAlert = false;
      let todayCount = 0;
      const stringifyValue = (value) => {
        if (typeof value === 'string') return value;
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      };
      const storageConnection = getStorageConnection();
      if (storageConnection && storageConnection.getAlertByHash) {
        const alertHash = stringifyValue(alertType) + '|' + stringifyValue(alertData);
        const hash = crypto.createHash('sha256').update(alertHash).digest('hex');
        const alertRecord = {
          alertHash: hash,
          notificationConfig: notificationConfig,
          time: alertData.time
        };
        try {
          const existingAlert = await storageConnection.getAlertByHash(alertRecord);
          if (existingAlert) {
            const existingAlertTime = existingAlert.createdAt;
            todayCount = existingAlert.todayCount;
            if (existingAlertTime) {
              const now = new Date();
              const existingDate = new Date(existingAlertTime);
              now.getFullYear() === existingDate.getFullYear() &&
                now.getMonth() === existingDate.getMonth() &&
                now.getDate() === existingDate.getDate() &&
                now.getHours() === existingDate.getHours() &&
                (isDuplicateAlert = true);
            }
          }
        } catch (err) {
          return console.error('Error checking duplicate alert', err), false;
        }
      }
      return { isDuplicateAlert, todayCount };
    };

    function parseDate(date) {
      const parsedDate = new Date(date);
      if (parsedDate.getTime() === 0) {
        parsedDate.setDate(parsedDate.getDate() - 1);
        parsedDate.setHours(0, 0, 0, 0);
      }
      return parsedDate;
    }

    exports.emailAlerts = emailAlerts;
    exports.slackAlerts = slackAlerts;
  }
});

var Jsonapi = require_jsonapiUtil();
var NPMUpdates = require_npmUpdates();

var { getStorageConnection } = require_storageConnection();
var packageJson = require_package();
var helpers = require_helpers();
var Alerts = require_alerts();

exports.getConfig = async (req, res) => {
  try {
    const npmVersion = await NPMUpdates.checkForUpdates('errsole');
    const storageConnection = getStorageConnection();
    const npmUpdates = await NPMUpdates.checkForUpdates(storageConnection.name);
    const config = {};
    config.name = packageJson.name;
    config.version = packageJson.version;
    config.npmVersion = npmVersion;
    config.npmUpdates = storageConnection.name;
    config.storageConnection = storageConnection.type;
    config.notificationConfig = npmUpdates;
    config.notificationId = storageConnection.id;
    res.send(Jsonapi.serializer.serialize(Jsonapi.success, config));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.getNotificationConfig = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const notificationConfig = await storageConnection.getConfig('notificationConfig');
    notificationConfig && notificationConfig.value && (notificationConfig.value.value = JSON.parse(notificationConfig.value.value), delete notificationConfig.value.value.password);
    res.send(Jsonapi.serializer.serialize(Jsonapi.success, notificationConfig.value || {}));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.updateNotificationConfig = async (req, res) => {
  try {
    const { url } = helpers.getNotificationConfig(req.body);
    const notificationUrl = await helpers.isValidSlackWebhookUrl(url);
    if (!notificationUrl) {
      const error = {};
      error.title = 'Invalid Slack webhook URL';
      error.detail = 'Invalid Slack webhook URL';
      const errors = {};
      errors.errors = [error];
      return res.status(400).send(errors);
    } else {
      const storageConnection = getStorageConnection();
      const notificationConfig = await storageConnection.getConfig('notificationConfig');
      if (notificationConfig && !notificationConfig.value) {
        const notificationConfigData = {};
        notificationConfigData.url = url;
        notificationConfigData.type = 'slack';
        notificationConfigData.enabled = true;
        const newNotificationConfig = notificationConfigData;
        const savedNotificationConfig = await storageConnection.setConfig('notificationConfig', JSON.stringify(newNotificationConfig));
        if (savedNotificationConfig && savedNotificationConfig.value) {
          savedNotificationConfig.value.value = JSON.parse(savedNotificationConfig.value.value);
          res.send(Jsonapi.serializer.serialize(Jsonapi.success, savedNotificationConfig.value));
        } else {
          const error = {};
          error.title = 'Error';
          error.detail = 'Error saving notification config';
          const errors = {};
          errors.errors = [error];
          res.status(500).send(errors);
        }
      } else {
        const error = {};
        error.title = 'Error';
        error.detail = 'Notification config already exists';
        const errors = {};
        errors.errors = [error];
        res.status(400).send(errors);
      }
    }
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.getNotificationConfigs = async (req, res) => {
  try {
    const { status } = helpers.getNotificationConfig(req.body);
    const storageConnection = getStorageConnection();
    const notificationConfig = await storageConnection.getConfig('notificationConfig');
    if (notificationConfig && notificationConfig.value) {
      let notificationConfigData;
      try {
        notificationConfigData = JSON.parse(notificationConfig.value.value);
        notificationConfigData.status = JSON.parse(status);
      } catch (err) {
        console.error(err);
        const error = {};
        error.title = 'Error';
        error.detail = err && err.message ? err.message : 'Unknown error';
        const errors = {};
        errors.errors = [error];
        res.status(500).send(errors);
      }
      notificationConfig.value.value = JSON.parse(notificationConfig.value.value);
      const updatedNotificationConfig = await storageConnection.setConfig('notificationConfig', JSON.stringify(notificationConfigData));
      if (updatedNotificationConfig && updatedNotificationConfig.value) {
        updatedNotificationConfig.value.value = JSON.parse(updatedNotificationConfig.value.value);
        res.send(Jsonapi.serializer.serialize(Jsonapi.success, updatedNotificationConfig.value));
      } else {
        const error = {};
        error.title = 'Error';
        error.detail = 'Error updating notification config';
        const errors = {};
        errors.errors = [error];
        res.status(500).send(errors);
      }
    } else {
      const error = {};
      error.title = 'Error';
      error.detail = 'Notification config not found';
      const errors = {};
      errors.errors = [error];
      res.status(404).send(errors);
    }
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.getEmailConfig = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const emailConfig = await storageConnection.getConfig('email');
    if (emailConfig && emailConfig.value) {
      emailConfig.value.value = JSON.parse(emailConfig.value.value);
      delete emailConfig.value.value.password;
    }
    res.send(Jsonapi.serializer.serialize(Jsonapi.success, emailConfig.value || {}));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.updateEmailConfig = async (req, res) => {
  try {
    const { sender, host, port, username, password, receivers } = helpers.getEmailConfig(req.body);
    const storageConnection = getStorageConnection();
    const emailConfig = {};
    emailConfig.sender = sender;
    emailConfig.host = host;
    emailConfig.port = port;
    emailConfig.username = username;
    emailConfig.password = password;
    emailConfig.receivers = receivers;
    emailConfig.enabled = true;
    const newEmailConfig = emailConfig;
    const savedEmailConfig = await storageConnection.setConfig('email', JSON.stringify(newEmailConfig));
    if (savedEmailConfig && savedEmailConfig.value) {
      savedEmailConfig.value.value = JSON.parse(savedEmailConfig.value.value);
      await Alerts.sendEmailTestAlert();
      res.send(Jsonapi.serializer.serialize(Jsonapi.success, savedEmailConfig.value));
    } else {
      const error = {};
      error.title = 'Error';
      error.detail = 'Error saving email config';
      const errors = {};
      errors.errors = [error];
      res.status(500).send(errors);
    }
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.getSlackConfig = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const slackConfig = await storageConnection.getConfig('slack');
    if (slackConfig && slackConfig.value) {
      slackConfig.value.value = JSON.parse(slackConfig.value.value);
      delete slackConfig.value.value.password;
    }
    res.send(Jsonapi.serializer.serialize(Jsonapi.success, slackConfig.value || {}));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.updateSlackConfig = async (req, res) => {
  try {
    const { url } = helpers.getSlackConfig(req.body);
    const storageConnection = getStorageConnection();
    const slackConfig = {};
    slackConfig.url = url;
    const newSlackConfig = slackConfig;
    const savedSlackConfig = await storageConnection.setConfig('slack', JSON.stringify(newSlackConfig));
    if (savedSlackConfig && savedSlackConfig.value) {
      savedSlackConfig.value.value = JSON.parse(savedSlackConfig.value.value);
      res.send(Jsonapi.serializer.serialize(Jsonapi.success, savedSlackConfig.value));
    } else {
      const error = {};
      error.title = 'Error';
      error.detail = 'Error saving slack config';
      const errors = {};
      errors.errors = [error];
      res.status(500).send(errors);
    }
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.getAlertConfig = async (req, res) => {
  try {
    const { status } = helpers.getAlertConfig(req.body);
    const storageConnection = getStorageConnection();
    const alertConfig = await storageConnection.getConfig('alertConfig');
    if (alertConfig && alertConfig.value) {
      let alertConfigData;
      try {
        alertConfigData = JSON.parse(alertConfig.value.value);
        alertConfigData.status = JSON.parse(status);
      } catch (err) {
        console.error(err);
        const error = {};
        error.title = 'Error';
        error.detail = err && err.message ? err.message : 'Unknown error';
        const errors = {};
        errors.errors = [error];
        res.status(500).send(errors);
      }
      alertConfig.value.value = JSON.parse(alertConfig.value.value);
      const updatedAlertConfig = await storageConnection.setConfig('alertConfig', JSON.stringify(alertConfigData));
      if (updatedAlertConfig && updatedAlertConfig.value) {
        updatedAlertConfig.value.value = JSON.parse(updatedAlertConfig.value.value);
        await Alerts.sendAlertTest();
        res.send(Jsonapi.serializer.serialize(Jsonapi.success, updatedAlertConfig.value));
      } else {
        const error = {};
        error.title = 'Error';
        error.detail = 'Error updating alert config';
        const errors = {};
        errors.errors = [error];
        res.status(500).send(errors);
      }
    } else {
      const error = {};
      error.title = 'Error';
      error.detail = 'Alert config not found';
      const errors = {};
      errors.errors = [error];
      res.status(404).send(errors);
    }
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.sendTestAlert = async (req, res) => {
  try {
    const testAlert = await Alerts.sendTestAlert('test', 'test');
    const response = {};
    response.success = testAlert;
    res.send(Jsonapi.serializer.serialize(Jsonapi.success, response));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.sendTestEmailAlert = async (req, res) => {
  try {
    const testEmailAlert = await Alerts.sendEmailTestAlert('test', 'test');
    const response = {};
    response.success = testEmailAlert;
    res.send(Jsonapi.serializer.serialize(Jsonapi.success, response));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};

exports.sendTestSlackAlert = async (req, res) => {
  try {
    const testSlackAlert = await Alerts.sendSlackTestAlert('test', 'test');
    const response = {};
    response.success = testSlackAlert;
    res.send(Jsonapi.serializer.serialize(Jsonapi.success, response));
  } catch (err) {
    console.error(err);
    const error = {};
    error.title = 'Error';
    error.detail = err && err.message ? err.message : 'Unknown error';
    const errors = {};
    errors.errors = [error];
    res.status(500).send(errors);
  }
};
