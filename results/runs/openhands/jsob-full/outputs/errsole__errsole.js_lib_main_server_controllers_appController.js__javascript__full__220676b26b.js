'use strict';

const axios = require('axios');
const crypto = require('crypto');
const JsonApiSerializer = require('json-api-serializer');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const APP_TYPE = 'apps';
const LOG_TYPE = 'logs';
const USER_TYPE = 'users';
const SLACK_CONFIG_KEY = 'slackIntegration';
const EMAIL_CONFIG_KEY = 'emailIntegration';
const ALERT_URL_CONFIG_KEY = 'alertUrl';
const JWT_SECRET_CONFIG_KEY = 'jwtSecret';
const INTERNAL_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';
const SEND_TIMEOUT_MS = 5000;
const PACKAGE_INFO = { name: 'errsole', version: '2.18.2' };

const Serializer = new JsonApiSerializer({ jsonapiObject: false });
Serializer.register(APP_TYPE, {});
Serializer.register(USER_TYPE, {});
Serializer.register(LOG_TYPE, {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});

let storageConnection = null;
let jwtSecret;

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

function isSlackWebhookUrl(url) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(url);
}

async function addJWTSecret() {
  try {
    const storage = getStorageConnection();
    const existing = await storage.getConfig(JWT_SECRET_CONFIG_KEY);

    if (existing && existing.item && existing.item.key === JWT_SECRET_CONFIG_KEY) {
      jwtSecret = existing.item.value;
    } else {
      const secret = uuidv4();
      const saved = await storage.setConfig(JWT_SECRET_CONFIG_KEY, secret);
      if (saved && saved.item && saved.item.key === JWT_SECRET_CONFIG_KEY) {
        jwtSecret = saved.item.value;
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
  const response = await axios({
    method: 'get',
    url: `https://registry.npmjs.org/${packageName}/latest`,
  });

  if (response.status === 200 && response.data) {
    return response.data.version || '0.0.0';
  }

  throw new Error('badRequest');
}

function roundUpToWholeSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds() > 0) {
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
  }
  return date;
}

function buildDashboardUrl(baseUrl, errsoleId, timestamp) {
  if (!baseUrl || !errsoleId) return undefined;
  const resolvedTimestamp = timestamp
    ? roundUpToWholeSecond(timestamp).toISOString()
    : new Date(Date.now() + 2000).toISOString();
  return `${baseUrl}#/logs?errsole_log_id=${errsoleId}&timestamp=${resolvedTimestamp}`;
}

function timeoutAfter(message) {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error(message)), SEND_TIMEOUT_MS);
  });
}

function metadataBlock(label, value) {
  return {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          { type: 'text', text: label, style: { bold: true } },
          { type: 'text', text: value },
        ],
      },
    ],
  };
}

function buildSlackPayload(message, alertType, metadata = {}, dashboardUrl, todayCount) {
  const payload = {
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: ` :warning: *Errsole: ${alertType}*` },
      },
    ],
  };

  if (metadata.appName) payload.blocks.push(metadataBlock('App Name: ', metadata.appName));
  if (metadata.environmentName) {
    payload.blocks.push(metadataBlock('Environment Name: ', metadata.environmentName));
  }
  if (metadata.serverName) payload.blocks.push(metadataBlock('Server Name: ', metadata.serverName));

  payload.blocks.push({
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_preformatted',
        elements: [{ type: 'text', text: message }],
      },
    ],
  });

  if (todayCount) {
    const subject = alertType === 'Alert' ? 'alert' : 'error';
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This ${subject} has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`,
      },
    });
  }

  if (dashboardUrl) {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${dashboardUrl}|Click here> to view the logs in the Errsole dashboard.`,
      },
    });
  }

  if (alertType === 'Alert') {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._',
      },
    });
  } else if (alertType !== 'Test') {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Note:_\n• _You will not receive another notification for this error on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._',
      },
    });
  }

  payload.blocks.push({ type: 'divider' });
  return payload;
}

const SlackService = {
  async sendAlert(message, alertType, metadata = {}, errsoleId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const storedSlackConfig = await storage.getConfig(SLACK_CONFIG_KEY);
      if (!storedSlackConfig || !storedSlackConfig.item) return false;

      const slackConfig = JSON.parse(storedSlackConfig.item.value);
      if (!slackConfig.status) return false;

      let dashboardUrl;
      const storedAlertUrl = await storage.getConfig(ALERT_URL_CONFIG_KEY);
      if (storedAlertUrl && storedAlertUrl.item && errsoleId) {
        const alertUrlConfig = JSON.parse(storedAlertUrl.item.value);
        dashboardUrl = buildDashboardUrl(alertUrlConfig.url, errsoleId, timestamp);
      }

      const payload = buildSlackPayload(
        message,
        alertType,
        metadata,
        dashboardUrl,
        todayCount,
      );
      payload.username = slackConfig.username || 'Errsole';
      payload.icon_url =
        slackConfig.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

      await Promise.race([
        axios.post(slackConfig.url, payload),
        timeoutAfter('Slack send timed out'),
      ]);
      return true;
    } catch (error) {
      console.error('Failed to send slack alert:', error);
      return false;
    }
  },
};

function buildEmailSubject(alertType, metadata) {
  if (metadata.appName && metadata.environmentName) {
    return `Errsole: ${alertType} (${metadata.appName} app, ${metadata.environmentName} environment)`;
  }
  if (metadata.appName) return `Errsole: ${alertType} (${metadata.appName} app)`;
  if (metadata.environmentName) {
    return `Errsole: ${alertType} (${metadata.environmentName} environment)`;
  }
  return `Errsole: ${alertType}`;
}

function buildEmailHtml(message, alertType, metadata, dashboardUrl, todayCount) {
  let metadataHtml = '';
  if (metadata.appName) metadataHtml += `<p><b>App Name:</b> ${metadata.appName}</p>`;
  if (metadata.environmentName) {
    metadataHtml += `<p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
  }
  if (metadata.serverName) metadataHtml += `<p><b>Server Name:</b> ${metadata.serverName}</p>`;

  let html = `${metadataHtml}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
  if (todayCount) {
    const subject = alertType === 'Alert' ? 'alert' : 'error';
    html += `<p>This ${subject} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
  }
  if (dashboardUrl) {
    html += `<p><a href="${dashboardUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
  }
  const noteSubject = alertType === 'Alert' ? 'alert' : 'error';
  html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this ${noteSubject} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
  return html;
}

const EmailService = {
  transporter: null,

  async emailTransport() {
    try {
      if (this.transporter !== null) return;
      const storage = getStorageConnection();
      const storedEmailConfig = await storage.getConfig(EMAIL_CONFIG_KEY);
      if (!storedEmailConfig || !storedEmailConfig.item) return;

      const emailConfig = JSON.parse(storedEmailConfig.item.value);
      const port = parseInt(emailConfig.port, 10);
      this.transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10,
        host: emailConfig.host,
        port,
        secure: port === 465,
        auth: {
          user: emailConfig.username,
          pass: emailConfig.password,
        },
      });
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, metadata = {}, errsoleId, todayCount, timestamp) {
    try {
      await this.emailTransport();
      if (this.transporter === null) return false;

      const storage = getStorageConnection();
      const storedEmailConfig = await storage.getConfig(EMAIL_CONFIG_KEY);
      if (!storedEmailConfig || !storedEmailConfig.item) return false;

      const emailConfig = JSON.parse(storedEmailConfig.item.value);
      if (!emailConfig.status) return false;

      let dashboardUrl;
      const storedAlertUrl = await storage.getConfig(ALERT_URL_CONFIG_KEY);
      if (storedAlertUrl && storedAlertUrl.item && errsoleId) {
        const alertUrlConfig = JSON.parse(storedAlertUrl.item.value);
        dashboardUrl = buildDashboardUrl(alertUrlConfig.url, errsoleId, timestamp);
      }

      const mail = {
        from: emailConfig.sender,
        to: emailConfig.receivers,
        subject: buildEmailSubject(alertType, metadata),
        html: buildEmailHtml(message, alertType, metadata, dashboardUrl, todayCount),
      };

      try {
        await Promise.race([
          this.transporter.sendMail(mail),
          timeoutAfter('Email send timed out'),
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
  },
};

async function clearEmailTransport() {
  EmailService.transporter = null;
  return true;
}

function serializeForHash(value) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function recordNotification(message, metadata, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const storage = getStorageConnection();

  if (storage && storage.insertNotificationItem) {
    const hashSource = `${serializeForHash(message)}|${serializeForHash(metadata)}`;
    const hashedMessage = crypto.createHash('sha256').update(hashSource).digest('hex');

    try {
      const result = await storage.insertNotificationItem({
        errsole_id: errsoleId,
        hashed_message: hashedMessage,
        hostname: metadata.serverName,
      });
      if (result) {
        todayCount = result.todayNotificationCount;
        const previous = result.previousNotificationItem;
        if (previous) {
          const now = new Date();
          const previousDate = new Date(previous.created_at);
          isDuplicateAlert =
            now.getUTCFullYear() === previousDate.getUTCFullYear() &&
            now.getUTCMonth() === previousDate.getUTCMonth() &&
            now.getUTCDate() === previousDate.getUTCDate() &&
            now.getUTCHours() === previousDate.getUTCHours();
        }
      }
    } catch (error) {
      console.error('Error inserting notification item:', error);
      return false;
    }
  }

  return { isDuplicateAlert, todayCount };
}

async function sendRecordedAlert(message, alertType, metadata, errsoleId, timestamp) {
  const result = await recordNotification(message, metadata, errsoleId);
  const { isDuplicateAlert, todayCount } = result || {};
  if (isDuplicateAlert) return false;

  await SlackService.sendAlert(message, alertType, metadata, errsoleId, todayCount, timestamp);
  await EmailService.sendAlert(message, alertType, metadata, errsoleId, todayCount, timestamp);
  return true;
}

async function customLoggerAlert(message, metadata, errsoleId, timestamp) {
  try {
    return await sendRecordedAlert(message, 'Alert', metadata, errsoleId, timestamp);
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
}

async function handleUncaughtExceptions(message, metadata, errsoleId, timestamp) {
  try {
    return await sendRecordedAlert(
      message,
      'Uncaught Exception',
      metadata,
      errsoleId,
      timestamp,
    );
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

function sendSerialized(response, value) {
  response.send(Serializer.serialize(APP_TYPE, value));
}

function sendError(response, error, label = INTERNAL_ERROR) {
  if (error) console.error(error);
  response.status(500).send({
    errors: [
      {
        error: label,
        message: error && error.message ? error.message : UNEXPECTED_ERROR,
      },
    ],
  });
}

function sendConflict(response, message) {
  response.status(409).send({ errors: [{ error: 'Conflict', message }] });
}

function parseStoredItem(result) {
  if (result && result.item) result.item.value = JSON.parse(result.item.value);
  return result && result.item ? result.item : {};
}

exports.checkUpdates = async function checkUpdates(_request, response) {
  try {
    const latestVersion = await fetchLatestVersion(PACKAGE_INFO.name);
    const storage = getStorageConnection();
    const latestStorageVersion = await fetchLatestVersion(storage.name);
    sendSerialized(response, {
      name: PACKAGE_INFO.name,
      version: PACKAGE_INFO.version,
      latest_version: latestVersion,
      storage_name: storage.name,
      storage_version: storage.version,
      storage_latest_version: latestStorageVersion,
      storage_dialect: storage.dialect,
    });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getSlackDetails = async function getSlackDetails(_request, response) {
  try {
    const result = await getStorageConnection().getConfig(SLACK_CONFIG_KEY);
    const item = parseStoredItem(result);
    if (item.value) delete item.value.url;
    sendSerialized(response, item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.addSlackDetails = async function addSlackDetails(request, response) {
  try {
    const { url } = extractAttributes(request.body);
    if (!isSlackWebhookUrl(url)) {
      return sendConflict(response, 'You have sent a url which is not a slack url.');
    }

    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);
    if (!existing || existing.item) {
      return sendConflict(response, 'You have already added a webhook url for slack.');
    }

    const result = await storage.setConfig(
      SLACK_CONFIG_KEY,
      JSON.stringify({
        url,
        username: 'Errsole',
        icon_url: 'https://avatars.githubusercontent.com/u/84983840',
        status: true,
      }),
    );
    if (!result || !result.item) return sendError(response);

    sendSerialized(response, parseStoredItem(result));
  } catch (error) {
    sendError(response, error);
  }
};

async function updateIntegrationStatus(request, response, configKey, clearTransport) {
  try {
    const { status } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(configKey);
    if (!existing || !existing.item) return sendError(response);

    let config;
    try {
      config = JSON.parse(existing.item.value);
      config.status = JSON.parse(status);
    } catch (error) {
      sendError(response, error);
    }

    existing.item.value.status = JSON.parse(status);
    const result = await storage.setConfig(configKey, JSON.stringify(config));
    if (!result || !result.item) return sendError(response);

    if (clearTransport) await clearEmailTransport();
    sendSerialized(response, parseStoredItem(result));
  } catch (error) {
    sendError(response, error);
  }
}

exports.updateSlackDetails = async function updateSlackDetails(request, response) {
  return updateIntegrationStatus(request, response, SLACK_CONFIG_KEY, false);
};

exports.deleteSlackDetails = async function deleteSlackDetails(_request, response) {
  try {
    const deleted = await getStorageConnection().deleteConfig(SLACK_CONFIG_KEY);
    if (!deleted) return sendError(response);
    sendSerialized(response, { data: 'slack integration has been removed' });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getEmailDetails = async function getEmailDetails(_request, response) {
  try {
    const result = await getStorageConnection().getConfig(EMAIL_CONFIG_KEY);
    const item = parseStoredItem(result);
    if (item.value) delete item.value.url;
    sendSerialized(response, item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.addEmailDetails = async function addEmailDetails(request, response) {
  try {
    const { sender, host, port, username, password, receivers } = extractAttributes(
      request.body,
    );
    const result = await getStorageConnection().setConfig(
      EMAIL_CONFIG_KEY,
      JSON.stringify({ sender, host, port, username, password, receivers, status: true }),
    );
    if (!result || !result.item) return sendError(response);

    await clearEmailTransport();
    sendSerialized(response, parseStoredItem(result));
  } catch (error) {
    sendError(response, error);
  }
};

exports.updateEmailDetails = async function updateEmailDetails(request, response) {
  return updateIntegrationStatus(request, response, EMAIL_CONFIG_KEY, true);
};

exports.deleteEmailDetails = async function deleteEmailDetails(request, response) {
  try {
    const { url } = extractAttributes(request.body);
    const deleted = await getStorageConnection().deleteConfig(EMAIL_CONFIG_KEY);
    if (!deleted) return sendError(response);
    sendSerialized(response, { url });
  } catch (error) {
    sendError(response, error);
  }
};

exports.testSlackNotification = async function testSlackNotification(_request, response) {
  try {
    const success = await testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification',
    );
    sendSerialized(response, { success });
  } catch (error) {
    sendError(response, error);
  }
};

exports.testEmailNotification = async function testEmailNotification(_request, response) {
  try {
    const success = await testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification',
    );
    sendSerialized(response, { success });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getAlertUrlDetails = async function getAlertUrlDetails(_request, response) {
  try {
    const result = await getStorageConnection().getConfig(ALERT_URL_CONFIG_KEY);
    sendSerialized(response, parseStoredItem(result));
  } catch (error) {
    sendError(response, error);
  }
};

exports.addAlertUrlDetails = async function addAlertUrlDetails(request, response) {
  try {
    const { url } = extractAttributes(request.body);
    const result = await getStorageConnection().setConfig(
      ALERT_URL_CONFIG_KEY,
      JSON.stringify({ url }),
    );
    if (!result || !result.item) return sendError(response);
    sendSerialized(response, parseStoredItem(result));
  } catch (error) {
    sendError(response, error);
  }
};
