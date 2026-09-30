'use strict';

const axios = require('axios');
const crypto = require('crypto');
const JsonApiSerializer = require('json-api-serializer');
const nodemailer = require('nodemailer');
const { v4: uuid } = require('uuid');

const PACKAGE_NAME = 'errsole';
const PACKAGE_VERSION = '2.18.2';
const SLACK_CONFIG_KEY = 'slackIntegration';
const EMAIL_CONFIG_KEY = 'emailIntegration';
const ALERT_URL_CONFIG_KEY = 'alertUrl';
const JWT_SECRET_CONFIG_KEY = 'jwtSecret';
const INTERNAL_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';
const DEFAULT_SLACK_USERNAME = 'Errsole';
const DEFAULT_SLACK_ICON = 'https://avatars.githubusercontent.com/u/84983840';

const Serializer = new JsonApiSerializer({ jsonapiObject: false });
const AppType = 'apps';
const UserType = 'users';
const LogType = 'logs';
Serializer.register(UserType, {});
Serializer.register(AppType, {});
Serializer.register(LogType, {
  topLevelMeta(_records, filters) {
    return { filters };
  }
});

let storageConnection = null;

function initializeStorageConnection(connection) {
  if (!storageConnection) storageConnection = connection;
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

function extractAttributes(body) {
  return body && body.data && body.data.attributes ? body.data.attributes : {};
}

function isSlackUrl(url) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(url);
}

let jwtSecret;

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const existing = await storage.getConfig(JWT_SECRET_CONFIG_KEY);
    if (existing && existing.item && existing.item.key === JWT_SECRET_CONFIG_KEY) {
      jwtSecret = existing.item.value;
    } else {
      const created = await storage.setConfig(JWT_SECRET_CONFIG_KEY, uuid());
      if (created && created.item && created.item.key === JWT_SECRET_CONFIG_KEY) {
        jwtSecret = created.item.value;
      }
    }
    return jwtSecret || false;
  } catch (error) {
    console.error('An error occurred in addJWTSecret:', error);
    throw error;
  }
}

function getJWTSecret() {
  return jwtSecret || false;
}

async function fetchLatestVersion(packageName) {
  const result = await axios({
    method: 'get',
    url: `https://registry.npmjs.org/${packageName}/latest`
  });
  if (result.status !== 200 || !result.data) throw new Error('badRequest');
  return result.data.version || '0.0.0';
}

function serializeApp(value) {
  return Serializer.serialize(AppType, value);
}

function errorPayload(error, fallback = UNEXPECTED_ERROR) {
  return {
    errors: [{
      error: INTERNAL_ERROR,
      message: error && error.message ? error.message : fallback
    }]
  };
}

function sendInternalError(response, error) {
  console.error(error);
  response.status(500).send(errorPayload(error));
}

function sendUnexpectedError(response) {
  response.status(500).send(errorPayload(null));
}

function roundLogTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (date.getMilliseconds() > 0) {
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
  }
  return date;
}

function stringifyForHash(value) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function registerNotification(message, details, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const storage = getStorageConnection();

  if (!storage || !storage.insertNotificationItem) {
    return { isDuplicateAlert, todayCount };
  }

  const hashInput = `${stringifyForHash(message)}|${stringifyForHash(details)}`;
  const notification = {
    errsole_id: errsoleId,
    hashed_message: crypto.createHash('sha256').update(hashInput).digest('hex'),
    hostname: details.serverName
  };

  try {
    const result = await storage.insertNotificationItem(notification);
    if (result) {
      todayCount = result.todayNotificationCount;
      if (result.previousNotificationItem) {
        const now = new Date();
        const previous = new Date(result.previousNotificationItem.created_at);
        isDuplicateAlert = now.getUTCFullYear() === previous.getUTCFullYear()
          && now.getUTCMonth() === previous.getUTCMonth()
          && now.getUTCDate() === previous.getUTCDate()
          && now.getUTCHours() === previous.getUTCHours();
      }
    }
  } catch (error) {
    console.error('Error inserting notification item:', error);
  }

  return { isDuplicateAlert, todayCount };
}

function buildLogUrl(alertUrl, logId, timestamp) {
  const date = timestamp
    ? roundLogTimestamp(timestamp)
    : new Date(Date.now() + 2000);
  return `${alertUrl}#/logs?errsole_log_id=${logId}&timestamp=${date.toISOString()}`;
}

function slackRichText(label, value) {
  return {
    type: 'rich_text',
    elements: [{
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: label, style: { bold: true } },
        { type: 'text', text: value }
      ]
    }]
  };
}

function buildSlackMessage(message, alertType, details = {}, logUrl, todayCount) {
  const payload = { blocks: [] };
  payload.blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: ` :warning: *Errsole: ${alertType}*` }
  });

  if (details.appName) payload.blocks.push(slackRichText('App Name: ', details.appName));
  if (details.environmentName) {
    payload.blocks.push(slackRichText('Environment Name: ', details.environmentName));
  }
  if (details.serverName) payload.blocks.push(slackRichText('Server Name: ', details.serverName));
  payload.blocks.push({
    type: 'rich_text',
    elements: [{
      type: 'rich_text_preformatted',
      elements: [{ type: 'text', text: message }]
    }]
  });

  if (todayCount) {
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This ${noun} has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`
      }
    });
  }
  if (logUrl) {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${logUrl}|Click here> to view the logs in the Errsole dashboard.`
      }
    });
  }
  if (alertType !== 'Test') {
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_Note:_\n• _You will not receive another notification for this ${noun} on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._`
      }
    });
  }
  payload.blocks.push({ type: 'divider' });
  return payload;
}

function rejectAfter(milliseconds, message) {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error(message)), milliseconds);
  });
}

const SlackService = {
  async sendAlert(message, alertType, details = {}, logId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const storedConfig = await storage.getConfig(SLACK_CONFIG_KEY);
      if (!storedConfig || !storedConfig.item) return false;

      const config = JSON.parse(storedConfig.item.value);
      if (!config.status) return false;

      const storedAlertUrl = await storage.getConfig(ALERT_URL_CONFIG_KEY);
      let logUrl;
      if (storedAlertUrl && storedAlertUrl.item && logId) {
        logUrl = buildLogUrl(JSON.parse(storedAlertUrl.item.value).url, logId, timestamp);
      }

      const payload = buildSlackMessage(message, alertType, details, logUrl, todayCount);
      payload.username = config.username || DEFAULT_SLACK_USERNAME;
      payload.icon_url = config.icon_url || DEFAULT_SLACK_ICON;

      try {
        await Promise.race([
          axios.post(config.url, payload),
          rejectAfter(5000, 'Slack send timed out')
        ]);
      } catch {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send slack alert:', error);
      return false;
    }
  }
};

const EmailService = {
  transporter: null,

  async emailTransport() {
    try {
      if (this.transporter === null) {
        const storage = getStorageConnection();
        const storedConfig = await storage.getConfig(EMAIL_CONFIG_KEY);
        if (storedConfig && storedConfig.item) {
          const config = JSON.parse(storedConfig.item.value);
          this.transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: config.host,
            port: parseInt(config.port),
            secure: parseInt(config.port) === 465,
            auth: { user: config.username, pass: config.password }
          });
        }
      }
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, details = {}, logId, todayCount, timestamp) {
    try {
      await this.emailTransport();
      if (this.transporter === null) return false;

      const storage = getStorageConnection();
      const storedConfig = await storage.getConfig(EMAIL_CONFIG_KEY);
      if (!storedConfig || !storedConfig.item) return false;

      const config = JSON.parse(storedConfig.item.value);
      if (!config.status) return false;

      const storedAlertUrl = await storage.getConfig(ALERT_URL_CONFIG_KEY);
      let logUrl;
      if (storedAlertUrl && storedAlertUrl.item && logId) {
        logUrl = buildLogUrl(JSON.parse(storedAlertUrl.item.value).url, logId, timestamp);
      }

      let subject = `Errsole: ${alertType}`;
      let detailsHtml = '';
      if (details.appName && details.environmentName) {
        subject += ` (${details.appName} app, ${details.environmentName} environment)`;
      } else if (details.appName) {
        subject += ` (${details.appName} app)`;
      } else if (details.environmentName) {
        subject += ` (${details.environmentName} environment)`;
      }
      if (details.appName) detailsHtml += `<p><b>App Name:</b> ${details.appName}</p>`;
      if (details.environmentName) {
        detailsHtml += `<p><b>Environment Name:</b> ${details.environmentName}</p>`;
      }
      if (details.serverName) detailsHtml += `<p><b>Server Name:</b> ${details.serverName}</p>`;

      let html = `${detailsHtml}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
      if (todayCount) {
        const noun = alertType === 'Alert' ? 'alert' : 'error';
        html += `<p>This ${noun} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
      }
      if (logUrl) html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      if (alertType !== 'Test') {
        const noun = alertType === 'Alert' ? 'alert' : 'error';
        html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this ${noun} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
      }

      try {
        await Promise.race([
          this.transporter.sendMail({
            from: config.sender,
            to: config.receivers,
            subject,
            html
          }),
          rejectAfter(5000, 'Email send timed out')
        ]);
      } catch (error) {
        console.log(error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send email alert:', error);
      return false;
    }
  }
};

async function clearEmailTransport() {
  EmailService.transporter = null;
  return true;
}

async function customLoggerAlert(message, details, errsoleId, timestamp) {
  try {
    const notification = await registerNotification(message, details, errsoleId);
    if (notification.isDuplicateAlert) return false;
    await SlackService.sendAlert(message, 'Alert', details, errsoleId, notification.todayCount, timestamp);
    await EmailService.sendAlert(message, 'Alert', details, errsoleId, notification.todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
}

async function handleUncaughtExceptions(message, details, errsoleId, timestamp) {
  try {
    const notification = await registerNotification(message, details, errsoleId);
    if (notification.isDuplicateAlert) return false;
    await SlackService.sendAlert(message, 'Uncaught Exception', details, errsoleId, notification.todayCount, timestamp);
    await EmailService.sendAlert(message, 'Uncaught Exception', details, errsoleId, notification.todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
}

async function testSlackAlert(message, title) {
  try {
    return await SlackService.sendAlert(message, 'Test', title);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
}

async function testEmailAlert(message, title) {
  try {
    return await EmailService.sendAlert(message, 'Test', title);
  } catch (error) {
    console.error('Error in testEmailAlert:', error);
    return false;
  }
}

exports.checkUpdates = async (request, response) => {
  try {
    const latestVersion = await fetchLatestVersion(PACKAGE_NAME);
    const storage = getStorageConnection();
    const storageLatestVersion = await fetchLatestVersion(storage.name);
    response.send(serializeApp({
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      latest_version: latestVersion,
      storage_name: storage.name,
      storage_version: storage.version,
      storage_latest_version: storageLatestVersion,
      storage_dialect: storage.dialect
    }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getSlackDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig(SLACK_CONFIG_KEY);
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    response.send(serializeApp(result.item || {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = extractAttributes(request.body);
    if (!isSlackUrl(url)) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have sent a url which is not a slack url.' }]
      });
    }

    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);
    if (!existing || existing.item) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have already added a webhook url for slack.' }]
      });
    }

    const result = await storage.setConfig(SLACK_CONFIG_KEY, JSON.stringify({
      url,
      username: DEFAULT_SLACK_USERNAME,
      icon_url: DEFAULT_SLACK_ICON,
      status: true
    }));
    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);
    if (!existing || !existing.item) return sendUnexpectedError(response);

    const config = JSON.parse(existing.item.value);
    config.status = JSON.parse(status);
    const result = await storage.setConfig(SLACK_CONFIG_KEY, JSON.stringify(config));
    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteSlackDetails = async (request, response) => {
  try {
    const deleted = await getStorageConnection().deleteConfig(SLACK_CONFIG_KEY);
    if (!deleted) return sendUnexpectedError(response);
    response.send(serializeApp({ data: 'slack integration has been removed' }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getEmailDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig(EMAIL_CONFIG_KEY);
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    response.send(serializeApp(result.item || {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const { sender, host, port, username, password, receivers } = extractAttributes(request.body);
    const config = { sender, host, port, username, password, receivers, status: true };
    const result = await getStorageConnection().setConfig(EMAIL_CONFIG_KEY, JSON.stringify(config));
    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    await clearEmailTransport();
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(EMAIL_CONFIG_KEY);
    if (!existing || !existing.item) return sendUnexpectedError(response);

    const config = JSON.parse(existing.item.value);
    config.status = JSON.parse(status);
    const result = await storage.setConfig(EMAIL_CONFIG_KEY, JSON.stringify(config));
    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    await clearEmailTransport();
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = extractAttributes(request.body);
    const deleted = await getStorageConnection().deleteConfig(EMAIL_CONFIG_KEY);
    if (!deleted) return sendUnexpectedError(response);
    response.send(serializeApp({ url }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.testSlackNotification = async (request, response) => {
  try {
    const success = await testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification'
    );
    response.send(serializeApp({ success }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.testEmailNotification = async (request, response) => {
  try {
    const success = await testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification'
    );
    response.send(serializeApp({ success }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAlertUrlDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig(ALERT_URL_CONFIG_KEY);
    if (result && result.item) result.item.value = JSON.parse(result.item.value);
    response.send(serializeApp(result.item || {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = extractAttributes(request.body);
    const result = await getStorageConnection().setConfig(
      ALERT_URL_CONFIG_KEY,
      JSON.stringify({ url })
    );
    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};
