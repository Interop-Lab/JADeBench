'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_jsonapiUtil = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(exports, module) {
    'use strict';
    const Jsonapi = require('jsonapi-serializer');
    module.exports = Jsonapi;
  }
});

var require_npmUpdates = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/npmUpdates.js'(exports, module) {
    'use strict';
    const axios = require('axios');
    var npmUpdates = {};
    npmUpdates.getLatestVersion = async function (packageName) {
      try {
        const response = await axios({
          method: 'get',
          url: 'https://registry.npmjs.org/' + packageName + '/latest'
        });
        if (response.status === 200 && response.data) {
          if (response.data.version) {
            return response.data.version;
          } else {
            return null;
          }
        } else {
          throw new Error('Failed to fetch package data');
        }
      } catch (error) {
        console.error('Error fetching npm updates:', error);
        throw error;
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
      if (!storageConnection) {
        storageConnection = connection;
      }
      return storageConnection;
    }
    function getStorageConnection() {
      if (!storageConnection) throw new Error('Storage connection has not been initialized.');
      return storageConnection;
    }
    const storageConnectionModule = {};
    storageConnectionModule.setStorageConnection = setStorageConnection;
    storageConnectionModule.getStorageConnection = getStorageConnection;
    module.exports = storageConnectionModule;
  }
});

var require_package = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/package.js'(exports, module) {
    'use strict';
    const packageJson = {
      name: 'errsole',
      version: '4.0.0',
      description: 'A Node.js error monitor and alerting tool.',
      author: 'errsole',
      license: 'MIT',
      homepage: 'https://github.com/errsole/errsole.js',
      repository: {
        type: 'git',
        url: 'https://github.com/errsole/errsole.js.git'
      },
      bugs: {
        url: 'https://github.com/errsole/errsole.js/issues'
      },
      keywords: [
        'error',
        'monitoring',
        'logging',
        'alerts'
      ],
      dependencies: {
        axios: '^1.6.2',
        nodemailer: '^6.9.9',
        'jsonapi-serializer': '^3.6.7',
        uuid: '^9.0.1'
      },
      devDependencies: {
        mocha: '^10.2.0',
        chai: '^4.4.1',
        sinon: '^17.0.1'
      },
      scripts: {
        test: 'mocha test/**/*.test.js',
        lint: 'eslint lib/**/*.js',
        coverage: 'nyc mocha test/**/*.test.js'
      },
      engines: {
        node: '>=14.0.0'
      }
    };
    module.exports = packageJson;
  }
});

var require_helpers = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(exports) {
    'use strict';
    var { v4: uuidv4 } = require('uuid');
    var { getStorageConnection } = require_storageConnection();
    var systemDetails;
    exports.parseNotificationData = (notificationData) => {
      return notificationData && notificationData.data && notificationData.data.attributes ? notificationData.data.attributes : {};
    };
    exports.validateSlackUrl = (url) => {
      const regex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return regex.test(url);
    };
    exports.getSystemDetails = async () => {
      try {
        const storage = getStorageConnection();
        const result = await storage.getData('systemDetails');
        if (result && result.data && result.data.value === 'success') {
          systemDetails = result.data.value;
        } else {
          const id = uuidv4();
          const updateResult = await storage.updateData('systemDetails', id);
          if (updateResult && updateResult.data && updateResult.data.value === 'success') {
            systemDetails = updateResult.data.value;
          }
        }
        return [systemDetails, false];
      } catch (error) {
        console.error('Error getting system details:', error);
        throw error;
      }
    };
    exports.hasSystemDetails = () => {
      return systemDetails ? systemDetails : false;
    };
  }
});

var require_alerts = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/utils/alerts.js'(exports) {
    'use strict';
    var { getStorageConnection } = require_storageConnection();
    var nodemailer = require('nodemailer');
    var crypto = require('crypto');
    var { v4: uuidv4 } = require('uuid');

    exports.sendAlert = async function (message, title, data, frequency) {
      try {
        const { isDuplicateAlert, todayCount } = await checkDuplicateAlert(message, title, data);
        if (isDuplicateAlert) return false;
        await emailAlert.sendAlert(message, 'email', title, data, todayCount, frequency);
        await slackAlert.sendAlert(message, 'slack', title, data, todayCount, frequency);
        return true;
      } catch (error) {
        return console.error('Error sending alert:', error), false;
      }
    };

    exports.resendAlert = async function (message, title, data, frequency) {
      try {
        const { isDuplicateAlert, todayCount } = await checkDuplicateAlert(message, title, data);
        if (isDuplicateAlert) return false;
        await emailAlert.sendAlert(message, 'email', title, data, todayCount, frequency);
        await slackAlert.sendAlert(message, 'slack', title, data, todayCount, frequency);
        return true;
      } catch (error) {
        return console.error('Error resending alert:', error), false;
      }
    };

    exports.testAlert = async function (message, title) {
      try {
        const result = await emailAlert.sendAlert(message, 'email', title);
        return result;
      } catch (error) {
        return console.error('Error testing alert:', error), false;
      }
    };

    exports.testSlackAlert = async function (message, title) {
      try {
        const result = await slackAlert.sendAlert(message, 'slack', title);
        return result;
      } catch (error) {
        return console.error('Error testing slack alert:', error), false;
      }
    };

    var emailAlert = {};
    emailAlert.sendAlert = async function (message, type, title, data, frequency, lastSentAt) {
      try {
        const storage = getStorageConnection();
        const emailConfig = await storage.getData('email');
        if (emailConfig && emailConfig.data) {
          const config = JSON.parse(emailConfig.data.value);
          if (!config.enabled) {
            return false;
          }
          const alertLog = await storage.getData('alertLog');
          let hashKey;
          if (alertLog && alertLog.data && frequency) {
            const logData = JSON.parse(alertLog.data.value);
            let expiryDate;
            if (!lastSentAt) {
              expiryDate = new Date(Math.floor(new Date().getTime() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000)).toISOString();
            } else {
              expiryDate = adjustToUTC(lastSentAt);
              expiryDate = expiryDate.toISOString();
            }
            hashKey = config.host + '|' + frequency + '|' + expiryDate;
          }
          const emailBody = buildEmailBody(message, title, data, hashKey, frequency);
          const transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: config.host,
            port: parseInt(config.port),
            secure: parseInt(config.secure) === 465,
            auth: {
              user: config.username,
              pass: config.password
            }
          });
          const mailOptions = {
            from: config.sender,
            to: config.receivers,
            subject: title,
            text: emailBody
          };
          const sendMailPromise = transporter.sendMail(mailOptions);
          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Email sending timed out. Please check your SMTP configurations.'));
            }, 10000);
          });
          try {
            await Promise.race([sendMailPromise, timeoutPromise]);
          } catch (error) {
            return false;
          }
          return true;
        }
        return false;
      } catch (error) {
        return console.error('Error sending email alert:', error), false;
      }
    };

    function buildEmailBody(message, title, data = {}, hashKey, frequency) {
      const emailBody = { blocks: [] };
      emailBody.blocks.push({ type: 'header', text: { type: 'plain_text', text: '*' + title + '*' } });
      if (data.errorMessage) {
        emailBody.blocks.push({
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Error Message:*', style: true },
            { type: 'plain_text', text: data.errorMessage }
          ]
        });
      }
      if (data.errorStack) {
        emailBody.blocks.push({
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Error Stack:*', style: true },
            { type: 'plain_text', text: data.errorStack }
          ]
        });
      }
      if (data.errorTime) {
        emailBody.blocks.push({
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Error Time:*', style: true },
            { type: 'plain_text', text: data.errorTime }
          ]
        });
      }
      emailBody.blocks.push({
        type: 'section',
        fields: [
          { type: 'plain_text', text: message }
        ]
      });
      if (frequency) {
        if (title === 'Error Alert') {
          emailBody.blocks.push({ type: 'section', text: { type: 'plain_text', text: '\n\n*This alert will be sent every ' + frequency + ' hour' + (frequency > 1 ? 's' : '') + ' if the error persists.*' } });
        } else {
          emailBody.blocks.push({ type: 'section', text: { type: 'plain_text', text: '\n\n*This alert will be sent every ' + frequency + ' hour' + (frequency > 1 ? 's' : '') + ' if the error persists.*' } });
        }
      }
      if (hashKey) {
        emailBody.blocks.push({ type: 'section', text: { type: 'plain_text', text: '\n\n*Alert ID: ' + hashKey + '*' } });
      }
      if (title === 'Error Alert') {
        emailBody.blocks.push({ type: 'section', text: { type: 'plain_text', text: '\n\n*Please check the Errsole dashboard for more details.*' } });
      } else {
        emailBody.blocks.push({ type: 'section', text: { type: 'plain_text', text: '\n\n*Please check the Errsole dashboard for more details.*' } });
      }
      const footer = {};
      footer.type = 'context';
      footer.elements = [{ type: 'mrkdwn', text: 'Powered by Errsole' }];
      emailBody.blocks.push(footer);
      return emailBody;
    }

    var slackAlert = {};
    slackAlert.slackClient = null;
    slackAlert.initSlackClient = async function () {
      try {
        if (this.slackClient === null) {
          const storage = getStorageConnection();
          const slackConfig = await storage.getData('slack');
          if (slackConfig && slackConfig.data) {
            const config = JSON.parse(slackConfig.data.value);
            this.slackClient = nodemailer.createTransport({
              pool: true,
              maxConnections: 5,
              maxMessages: 100,
              rateLimit: 10,
              host: config.host,
              port: parseInt(config.port),
              secure: parseInt(config.secure) === 465,
              auth: {
                user: config.username,
                pass: config.password
              }
            });
          }
        }
      } catch (error) {
        console.error('Error initializing slack client:', error);
        this.slackClient = null;
      }
    };

    slackAlert.sendAlert = async function (message, type, title, data, frequency, lastSentAt) {
      try {
        await slackAlert.initSlackClient();
        if (this.slackClient !== null) {
          const storage = getStorageConnection();
          const slackConfig = await storage.getData('slack');
          if (slackConfig && slackConfig.data) {
            const config = JSON.parse(slackConfig.data.value);
            if (!config.enabled) {
              return false;
            }
            const alertLog = await storage.getData('alertLog');
            let hashKey;
            if (alertLog && alertLog.data && frequency) {
              const logData = JSON.parse(alertLog.data.value);
              let expiryDate;
              if (!lastSentAt) {
                expiryDate = new Date(Math.floor(new Date().getTime() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000)).toISOString();
              } else {
                expiryDate = adjustToUTC(lastSentAt);
                expiryDate = expiryDate.toISOString();
              }
              hashKey = config.host + '|' + frequency + '|' + expiryDate;
            }
            let subject, body = '';
            if (data.errorMessage && data.errorStack) {
              subject = 'Error Alert: ' + title + ' (' + data.errorMessage + ')\n' + (data.errorStack ? data.errorStack : '');
              body = 'Error Alert: ' + title + '\n' + data.errorMessage + '\n' + (data.errorStack ? data.errorStack : '');
            } else {
              if (data.errorMessage) {
                subject = 'Error Alert: ' + title + ' (' + data.errorMessage + ')';
                body = 'Error Alert: ' + title + '\n' + data.errorMessage;
              } else if (data.errorStack) {
                subject = 'Error Alert: ' + title + ' (' + data.errorStack + ')';
                body = 'Error Alert: ' + title + '\n' + data.errorStack;
              } else {
                subject = 'Alert: ' + title;
              }
            }
            data.errorTime && (body += '\n\n*Error Time:*\n' + data.errorTime + '\n');
            message = body + '\n\n*Error Message:*\n\n' + message + '\n';
            frequency && (subject === 'Error Alert' ? message = message + '\n\n*This alert will be sent every ' + frequency + ' hour' + (frequency > 1 ? 's' : '') + ' if the error persists.*' : message = message + '\n\n*This alert will be sent every ' + frequency + ' hour' + (frequency > 1 ? 's' : '') + ' if the error persists.*');
            if (hashKey) {
              message = message + ('\n\n*Alert ID: ' + hashKey + '*');
            }
            if (subject === 'Error Alert') {
              message = message + ('\n\n*Please check the Errsole dashboard for more details.*');
            } else {
              message = message + ('\n\n*Please check the Errsole dashboard for more details.*');
            }
            const mailOptions = {};
            mailOptions.from = config.sender;
            mailOptions.to = config.receivers;
            mailOptions.subject = subject;
            mailOptions.text = message;
            const sendMailPromise = this.slackClient.sendMail(mailOptions);
            const timeoutPromise = new Promise((resolve, reject) => {
              setTimeout(() => {
                reject(new Error('Slack alert sending timed out.'));
              }, 10000);
            });
            try {
              await Promise.race([sendMailPromise, timeoutPromise]);
            } catch (error) {
              return console.error(error), false;
            }
            return true;
          }
        }
        return false;
      } catch (error) {
        return console.error('Error sending slack alert:', error), false;
      }
    };

    exports.clearAlerts = async function () {
      return slackAlert.slackClient = null, true;
    };

    var checkDuplicateAlert = async (message, title, data) => {
      let isDuplicate = false;
      let todayCount = 0;
      const parseValue = (value) => {
        if (typeof value !== 'string') return value;
        try {
          return JSON.parse(value);
        } catch {
          return String(value);
        }
      };
      const storage = getStorageConnection();
      if (storage && storage.getAlertLog) {
        const hashKey = parseValue(message) + '|' + parseValue(title);
        const hash = crypto.createHash('sha256').update('errsole').update(hashKey).digest('hex');
        const alertLog = { alertId: data, hashKey: hash, errorTime: title.errorTime };
        try {
          const result = await storage.getAlertLog(alertLog);
          if (result) {
            const logData = result.dataValues;
            todayCount = result.dataValues.todayCount;
            if (logData) {
              const currentDate = new Date();
              const logDate = new Date(logData.createdAt);
              if (currentDate.getFullYear() === logDate.getFullYear() && currentDate.getMonth() === logDate.getMonth() && currentDate.getDate() === logDate.getDate() && currentDate.getHours() === logDate.getHours()) {
                isDuplicate = true;
              }
            }
          }
        } catch (error) {
          return console.error('Error checking duplicate alert:', error), false;
        }
      }
      return { isDuplicateAlert: isDuplicate, todayCount: todayCount };
    };

    function adjustToUTC(dateString) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        date.setSeconds(date.getSeconds() + 10);
        date.setMinutes(0);
      }
      return date;
    }

    exports.emailAlert = emailAlert;
    exports.slackAlert = slackAlert;
  }
});

const Jsonapi = require_jsonapiUtil();
const NPMUpdates = require_npmUpdates();
var { getStorageConnection } = require_storageConnection();
var packageJson = require_package();
var helpers = require_helpers();
var Alerts = require_alerts();

exports.getSystemDetails = async (req, res) => {
  try {
    const latestVersion = await NPMUpdates.getLatestVersion('errsole');
    const storage = getStorageConnection();
    const storageType = await NPMUpdates.getLatestVersion(storage.type);
    const data = {};
    data.name = packageJson.name;
    data.version = packageJson.version;
    data.latest_version = latestVersion;
    data.storage_type = storage.type;
    data.storage_version = storage.version;
    data.latest_storage_version = storageType;
    data.node_version = process.version;
    const result = data;
    res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.SystemDetails, result));
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'system_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.getStorageDetails = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getData('systemDetails');
    if (result && result.data) {
      result.data.value = JSON.parse(result.data.value);
      delete result.data.dataValues.value;
    }
    res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.StorageDetails, result.data || {}));
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'storage_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.updateStorageDetails = async (req, res) => {
  try {
    const { url } = helpers.parseNotificationData(req.body);
    const isValid = await helpers.validateSlackUrl(url);
    if (!isValid) {
      const errorObj = {};
      errorObj.type = 'validation_error';
      errorObj.message = 'Invalid URL format';
      const errors = [errorObj];
      const errorResponse = {};
      errorResponse.errors = errors;
      return res.status(400).send(errorResponse);
    } else {
      const storage = getStorageConnection();
      const config = await storage.getData('slack');
      if (config && !config.data) {
        throw new Error('Slack configuration not found');
      }
      const updateData = {};
      updateData.url = url;
      updateData.type = 'slack';
      updateData.enabled = true;
      updateData.active = true;
      const result = await storage.updateData('slack', JSON.stringify(updateData));
      if (result && result.data) {
        result.data.value = JSON.parse(result.data.value);
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.StorageDetails, result.data));
      } else {
        const errorObj = {};
        errorObj.type = 'update_error';
        errorObj.message = 'Failed to update storage details';
        const errorResponse = {};
        errorResponse.errors = [errorObj];
        res.status(500).send(errorResponse);
      }
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'storage_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.getEmailNotifications = async (req, res) => {
  try {
    const { status } = helpers.parseNotificationData(req.body);
    const storage = getStorageConnection();
    const result = await storage.getData('email');
    if (result && result.data) {
      let config;
      try {
        config = JSON.parse(result.data.value);
        config.status = JSON.parse(status);
      } catch (error) {
        console.error(error);
        const errorObj = {};
        errorObj.type = 'parse_error';
        errorObj.message = error && error.message ? error.message : 'Failed to parse configuration';
        const errorResponse = {};
        errorResponse.errors = [errorObj];
        res.status(500).send(errorResponse);
      }
      result.data.dataValues.status = JSON.parse(status);
      const updated = await storage.updateData('email', JSON.stringify(config));
      if (updated && updated.data) {
        updated.data.value = JSON.parse(updated.data.value);
        await Alerts.clearAlerts();
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.EmailNotifications, updated.data));
      } else {
        const errorObj = {};
        errorObj.type = 'update_error';
        errorObj.message = 'Failed to update email notifications';
        const errorResponse = {};
        errorResponse.errors = [errorObj];
        res.status(500).send(errorResponse);
      }
    } else {
      const errorObj = {};
      errorObj.type = 'not_found';
      errorObj.message = 'Email configuration not found';
      const errorResponse = {};
      errorResponse.errors = [errorObj];
      res.status(404).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'email_notification_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.getSlackNotifications = async (req, res) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getData('slack');
    if (result) {
      const data = {};
      data.type = 'slackNotifications';
      res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.SlackNotifications, data));
    } else {
      const errorObj = {};
      errorObj.type = 'not_found';
      errorObj.message = 'Slack configuration not found';
      const errorResponse = {};
      errorResponse.errors = [errorObj];
      res.status(404).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'slack_notification_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.updateEmailNotifications = async (req, res) => {
  try {
    const { sender, host, port, username, password, receivers } = helpers.parseNotificationData(req.body);
    const storage = getStorageConnection();
    const config = {};
    config.sender = sender;
    config.host = host;
    config.port = port;
    config.username = username;
    config.password = password;
    config.receivers = receivers;
    config.enabled = true;
    const result = await storage.updateData('email', JSON.stringify(config));
    if (result && result.data) {
      result.data.value = JSON.parse(result.data.value);
      await Alerts.clearAlerts();
      res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.EmailNotifications, result.data));
    } else {
      const errorObj = {};
      errorObj.type = 'update_error';
      errorObj.message = 'Failed to update email notifications';
      const errorResponse = {};
      errorResponse.errors = [errorObj];
      res.status(500).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'email_notification_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.updateSlackNotifications = async (req, res) => {
  try {
    const { status } = helpers.parseNotificationData(req.body);
    const storage = getStorageConnection();
    const result = await storage.getData('slack');
    if (result && result.data) {
      let config;
      try {
        config = JSON.parse(result.data.value);
        config.status = JSON.parse(status);
      } catch (error) {
        console.error(error);
        const errorObj = {};
        errorObj.type = 'parse_error';
        errorObj.message = error && error.message ? error.message : 'Failed to parse configuration';
        const errorResponse = {};
        errorResponse.errors = [errorObj];
        res.status(500).send(errorResponse);
      }
      result.data.dataValues.status = JSON.parse(status);
      const updated = await storage.updateData('slack', JSON.stringify(config));
      if (updated && updated.data) {
        updated.data.value = JSON.parse(updated.data.value);
        await Alerts.clearAlerts();
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.SlackNotifications, updated.data));
      } else {
        const errorObj = {};
        errorObj.type = 'update_error';
        errorObj.message = 'Failed to update slack notifications';
        const errorResponse = {};
        errorResponse.errors = [errorObj];
        res.status(500).send(errorResponse);
      }
    } else {
      const errorObj = {};
      errorObj.type = 'not_found';
      errorObj.message = 'Slack configuration not found';
      const errorResponse = {};
      errorResponse.errors = [errorObj];
      res.status(404).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'slack_notification_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.testEmailAlert = async (req, res) => {
  try {
    const { url } = helpers.parseNotificationData(req.body);
    const storage = getStorageConnection();
    const result = await storage.getData('slack');
    if (result) {
      const data = {};
      data.url = url;
      res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.SlackNotifications, data));
    } else {
      const errorObj = {};
      errorObj.type = 'not_found';
      errorObj.message = 'Slack configuration not found';
      const errorResponse = {};
      errorResponse.errors = [errorObj];
      res.status(404).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'test_email_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.testSlackAlert = async (req, res) => {
  try {
    const result = await Alerts.testAlert('test', 'Test Alert');
    const data = {};
    data.result = result;
    res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.TestResult, data));
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'test_slack_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.testEmailNotifications = async (req, res) => {
  try {
    const result = await Alerts.testSlackAlert('test', 'Test Slack Alert');
    const data = {};
    data.result = result;
    res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.TestResult, data));
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'test_email_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};

exports.getSlackAlerts = async (req, res) => {
  try {
    const { url } = helpers.parseNotificationData(req.body);
    const storage = getStorageConnection();
    const config = {};
    config.url = url;
    const result = await storage.updateData('slack', JSON.stringify(config));
    if (result && result.data) {
      result.data.value = JSON.parse(result.data.value);
      res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.SlackNotifications, result.data));
    } else {
      const errorObj = {};
      errorObj.type = 'update_error';
      errorObj.message = 'Failed to update slack configuration';
      const errorResponse = {};
      errorResponse.errors = [errorObj];
      res.status(500).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    const errorObj = {};
    errorObj.type = 'slack_alert_error';
    errorObj.message = error && error.message ? error.message : 'An unexpected error occurred';
    const errorResponse = {};
    errorResponse.errors = [errorObj];
    res.status(500).send(errorResponse);
  }
};
