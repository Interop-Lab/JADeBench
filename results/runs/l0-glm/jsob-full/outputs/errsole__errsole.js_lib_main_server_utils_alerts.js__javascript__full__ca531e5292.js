'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  var exports = {};
  return (mod || (cb[__getOwnPropNames(cb)[0]])((mod = exports), mod), mod.exports);
};
var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(module, exports) {
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
    const obj = {};
    obj.setStorageConnection = setStorageConnection;
    obj.getStorageConnection = getStorageConnection;
    module.exports = obj;
  }
});

var { getStorageConnection } = require_storageConnection();
var axios = require('axios');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

exports.sendAlertNotification = async function (errorMessage, timestamp, meta, frequency) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(errorMessage, timestamp, meta);
    if (isDuplicateAlert) {
      return false;
    }
    await SlackService.sendAlert(errorMessage, 'alert', timestamp, meta, todayCount, frequency);
    await EmailService.sendAlert(errorMessage, 'alert', timestamp, meta, todayCount, frequency);
    return true;
  } catch (err) {
    console.log('Error in sending alert notification:', err);
    return false;
  }
};

exports.sendAlertSummary = async function (errorMessage, timestamp, meta, frequency) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(errorMessage, timestamp, meta);
    if (isDuplicateAlert) return false;
    await SlackService.sendAlert(errorMessage, 'summary', timestamp, meta, todayCount, frequency);
    await EmailService.sendAlert(errorMessage, 'summary', timestamp, meta, todayCount, frequency);
    return true;
  } catch (err) {
    console.log('Error in sending alert summary:', err);
    return false;
  }
};

exports.sendSlackAlert = async function (errorMessage, timestamp) {
  try {
    const result = await SlackService.sendAlert(errorMessage, 'alert', timestamp);
    return result;
  } catch (err) {
    console.log('Error in sending Slack alert:', err);
    return false;
  }
};

exports.sendEmailAlert = async function (errorMessage, timestamp) {
  try {
    const result = await EmailService.sendAlert(errorMessage, 'alert', timestamp);
    return result;
  } catch (err) {
    console.log('Error in sending Email alert:', err);
    return false;
  }
};

var SlackService = {};

SlackService.sendAlert = async function (errorMessage, type, timestamp, frequency, todayCount, alertCount) {
  try {
    const storage = getStorageConnection();
    const slackConfig = await storage.getConfig('slackIntegration');
    if (slackConfig && slackConfig.value) {
      const slackData = JSON.parse(slackConfig.value);
      if (!slackData.url) return false;

      const alertFrequencyConfig = await storage.getConfig('alertFrequency');
      let nextAlertTime;
      if (alertFrequencyConfig && alertFrequencyConfig.value && frequency) {
        const frequencyData = JSON.parse(alertFrequencyConfig.value);
        let roundedTime;
        if (!alertCount) {
          roundedTime = new Date(new Date().getTime() - 86400000).toISOString();
        } else {
          roundedTime = roundUpToNextSecond(alertCount);
          roundedTime = roundedTime.toISOString();
        }
        nextAlertTime = frequencyData.lastAlert + '|' + frequency + '|' + roundedTime;
      }

      const url = slackData.url;
      const payload = blockKit(errorMessage, type, timestamp, nextAlertTime, todayCount);
      payload.username = slackData.username || 'Errsole';
      payload.icon_url = slackData.icon_url || 'https://avatars.githubusercontent.com/u/89082478';

      const request = axios.post(url, payload);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out. Please check your network connection.'));
        }, 5000);
      });

      try {
        await Promise.race([request, timeout]);
      } catch (err) {
        return false;
      }
      return true;
    }
    return false;
  } catch (err) {
    console.log('Error in sending Slack alert:', err);
    return false;
  }
};

function blockKit(errorMessage, type, timestamp = {}, nextAlertTime, todayCount) {
  const payload = {};
  payload.blocks = [];
  payload.blocks.push({ type: 'header', text: { type: 'plain_text', text: '*' + type + '*' } });

  if (timestamp.hostname) {
    const bold = {};
    bold.bold = true;
    const section = {};
    section.type = 'section';
    section.fields = [
      { type: 'mrkdwn', text: '*Hostname:*', style: bold },
      { type: 'plain_text', text: timestamp.hostname }
    ];
    payload.blocks.push(section);
  }
  if (timestamp.appName) {
    const bold = {};
    bold.bold = true;
    const section = {};
    section.type = 'section';
    section.fields = [
      { type: 'mrkdwn', text: '*App Name:*', style: bold },
      { type: 'plain_text', text: timestamp.appName }
    ];
    payload.blocks.push(section);
  }
  if (timestamp.serverName) {
    const bold = {};
    bold.bold = true;
    const section = {};
    section.type = 'section';
    section.fields = [
      { type: 'mrkdwn', text: '*Server Name:*', style: bold },
      { type: 'plain_text', text: timestamp.serverName }
    ];
    payload.blocks.push(section);
  }

  const section = {};
  section.type = 'section';
  section.fields = [{ type: 'mrkdwn', text: errorMessage }];
  payload.blocks.push(section);

  if (todayCount) {
    if (type === 'alert') {
      payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '*Today Alerts: ' + todayCount + (todayCount > 1 ? 's' : '') + '*' } });
    } else {
      payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '*Today Summaries: ' + todayCount + (todayCount > 1 ? 's' : '') + '*' } });
    }
  }

  if (nextAlertTime) {
    payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '*Next Alert: <' + nextAlertTime + '>*' } });
  }

  if (type === 'alert') {
    const context = {};
    context.type = 'context';
    context.elements = {};
    context.elements.type = 'plain_text';
    context.elements.text = 'Errsole';
    payload.blocks.push(context);
  } else {
    if (type === 'summary') {
      const context = {};
      context.type = 'context';
      context.elements = {};
      context.elements.type = 'plain_text';
      context.elements.text = 'Errsole';
      payload.blocks.push(context);
    }
  }

  return payload;
}

var EmailService = { transporter: null };

EmailService.setupTransporter = async function () {
  try {
    if (this.transporter === null) {
      const storage = getStorageConnection();
      const emailConfig = await storage.getConfig('emailIntegration');
      if (emailConfig && emailConfig.value) {
        const emailData = JSON.parse(emailConfig.value);
        this.transporter = nodemailer.createTransport({
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 10,
          host: emailData.host,
          port: parseInt(emailData.port),
          secure: parseInt(emailData.port) === 465,
          auth: { user: emailData.username, pass: emailData.password }
        });
      }
    }
  } catch (err) {
    console.log('Error in setting up email transporter:', err);
    this.transporter = null;
  }
};

EmailService.sendAlert = async function (errorMessage, type, timestamp, frequency, todayCount, alertCount) {
  try {
    await EmailService.setupTransporter();
    if (this.transporter !== null) {
      const storage = getStorageConnection();
      const emailConfig = await storage.getConfig('emailIntegration');
      if (emailConfig && emailConfig.value) {
        const emailData = JSON.parse(emailConfig.value);
        if (!emailData.enabled) return false;

        const alertFrequencyConfig = await storage.getConfig('alertFrequency');
        let nextAlertTime;
        if (alertFrequencyConfig && alertFrequencyConfig.value && frequency) {
          const frequencyData = JSON.parse(alertFrequencyConfig.value);
          let roundedTime;
          if (!alertCount) {
            roundedTime = new Date(new Date().getTime() - 86400000).toISOString();
          } else {
            roundedTime = roundUpToNextSecond(alertCount);
            roundedTime = roundedTime.toISOString();
          }
          nextAlertTime = frequencyData.lastAlert + '|' + frequency + '|' + roundedTime;
        }

        let subject, body = '';
        if (timestamp.hostname && timestamp.serverName) {
          subject = 'Alert ' + type + ' (' + timestamp.hostname + ' - ' + timestamp.serverName + ')';
          body = 'Hostname: ' + timestamp.hostname + '\nServer Name: ' + timestamp.serverName + '\n';
        } else {
          if (timestamp.hostname) {
            subject = 'Alert ' + type + ' (' + timestamp.hostname + ')';
            body = 'Hostname: ' + timestamp.hostname + '\n';
          } else {
            if (timestamp.serverName) {
              subject = 'Alert ' + type + ' (' + timestamp.serverName + ')';
              body = 'Server Name: ' + timestamp.serverName + '\n';
            } else {
              subject = 'Alert ' + type;
            }
          }
        }
        if (timestamp.appName) {
          body += 'App Name: ' + timestamp.appName + '\n';
        }
        errorMessage = body + 'Error Message:\n' + errorMessage + '\n';

        if (todayCount) {
          if (type === 'alert') {
            errorMessage = errorMessage + '\nToday Alerts: ' + todayCount + (todayCount > 1 ? 's' : '') + '\n';
          } else {
            errorMessage = errorMessage + '\nToday Summaries: ' + todayCount + (todayCount > 1 ? 's' : '') + '\n';
          }
        }

        if (nextAlertTime) {
          errorMessage = errorMessage + '\nNext Alert: <' + nextAlertTime + '>\n';
        }

        if (type === 'alert') {
          errorMessage = errorMessage + '\n--\nErrsole\nhttps://github.com/errsole/errsole.js\n';
        } else {
          errorMessage = errorMessage + '\n--\nErrsole\nhttps://github.com/errsole/errsole.js\n';
        }

        const mailOptions = {};
        mailOptions.from = emailData.fromEmail;
        mailOptions.to = emailData.toEmails;
        mailOptions.subject = subject;
        mailOptions.text = errorMessage;

        const sendMailPromise = this.transporter.sendMail(mailOptions);
        const timeout = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Email sending timed out. Please check your network connection.'));
          }, 5000);
        });

        try {
          await Promise.race([sendMailPromise, timeout]);
        } catch (err) {
          console.log(err);
          return false;
        }
        return true;
      }
      return false;
    }
  } catch (err) {
    console.log('Error in sending Email alert:', err);
    return false;
  }
};

exports.resetEmailTransporter = async function () {
  EmailService.transporter = null;
  return true;
};

var checkAlertStatus = async (errorMessage, type, meta) => {
  let isDuplicateAlert = false;
  let todayCount = 0;

  const safeStringify = obj => {
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  };

  const storage = getStorageConnection();
  if (storage && storage.getAlertLogByHash) {
    const hashInput = safeStringify(errorMessage) + '|' + safeStringify(type);
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
    const logEntry = {};
    logEntry.meta_id = meta;
    logEntry.alert_hash = hash;
    logEntry.type = type.name;

    try {
      const result = await storage.getAlertLogByHash(logEntry);
      if (result) {
        const lastAlert = result.lastAlert;
        todayCount = result.todayCount;
        if (lastAlert) {
          const currentDate = new Date();
          const lastAlertDate = new Date(lastAlert);
          if (currentDate.getFullYear() === lastAlertDate.getFullYear() &&
              currentDate.getMonth() === lastAlertDate.getMonth() &&
              currentDate.getDate() === lastAlertDate.getDate() &&
              currentDate.getHours() === lastAlertDate.getHours()) {
            isDuplicateAlert = true;
          }
        }
      }
    } catch (err) {
      console.log('Error in checking alert status:', err);
      return { isDuplicateAlert, todayCount };
    }
  }

  return { isDuplicateAlert, todayCount };
};

function roundUpToNextSecond(date) {
  const d = new Date(date);
  if (d.getMilliseconds() > 0) {
    d.setSeconds(d.getSeconds() + 1);
    d.setMilliseconds(0);
  }
  return d;
}

exports.SlackService = SlackService;
exports.EmailService = EmailService;
