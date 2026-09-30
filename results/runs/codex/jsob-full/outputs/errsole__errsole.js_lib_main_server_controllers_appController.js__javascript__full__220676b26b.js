'use strict';

const axios = require('axios');
const crypto = require('crypto');
const JsonApiSerializer = require('json-api-serializer');
const nodemailer = require('nodemailer');
const { v4: uuid } = require('uuid');

const INTERNAL_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';
const SLACK_CONFIG_KEY = 'slackIntegration';
const EMAIL_CONFIG_KEY = 'emailIntegration';
const ALERT_URL_CONFIG_KEY = 'alertUrl';
const JWT_SECRET_CONFIG_KEY = 'jwtSecret';

const Jsonapi = {
  LogType: 'logs',
  UserType: 'users',
  AppType: 'apps',
};

Jsonapi.Serializer = new JsonApiSerializer({ jsonapiObject: false });
Jsonapi.Serializer.register(Jsonapi.LogType, {
  topLevelMeta(_record, filters) {
    return { filters };
  },
});
Jsonapi.Serializer.register(Jsonapi.UserType, {});
Jsonapi.Serializer.register(Jsonapi.AppType, {});

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

const packageJson = {
  name: 'errsole',
  version: '2.18.2',
};

const NPMUpdates = {
  async fetchLatestVersion(packageName) {
    const response = await axios({
      method: 'get',
      url: `https://registry.npmjs.org/${packageName}/latest`,
    });

    if (response.status !== 200 || !response.data) {
      throw new Error('badRequest');
    }
    return response.data.version || '0.0.0';
  },
};

let jwtSecret;
const helpers = {
  extractAttributes(body) {
    return body && body.data && body.data.attributes ? body.data.attributes : {};
  },

  SlackUrl(url) {
    return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(url);
  },

  async addJWTSecret() {
    try {
      const storage = getStorageConnection();
      const existing = await storage.getConfig(JWT_SECRET_CONFIG_KEY);
      if (existing && existing.item && existing.item.key === JWT_SECRET_CONFIG_KEY) {
        jwtSecret = existing.item.value;
      } else {
        const saved = await storage.setConfig(JWT_SECRET_CONFIG_KEY, uuid());
        if (saved && saved.item && saved.item.key === JWT_SECRET_CONFIG_KEY) {
          jwtSecret = saved.item.value;
        }
      }
      return jwtSecret || false;
    } catch (error) {
      console.error('An error occurred in addJWTSecret:', error);
      throw error;
    }
  },

  getJWTSecret() {
    return jwtSecret || false;
  },
};

function delayRejection(message) {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error(message)), 5000);
  });
}

function timestampForLog(createdAt) {
  if (!createdAt) return new Date(Date.now() + 2000).toISOString();
  const timestamp = new Date(createdAt);
  if (timestamp.getMilliseconds() > 0) {
    timestamp.setSeconds(timestamp.getSeconds() + 1);
    timestamp.setMilliseconds(0);
  }
  return timestamp.toISOString();
}

function addSlackMetadataBlock(blocks, label, value) {
  if (!value) return;
  blocks.push({
    type: 'rich_text',
    elements: [{
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: `${label}: `, style: { bold: true } },
        { type: 'text', text: value },
      ],
    }],
  });
}

function buildSlackMessage(message, notificationType, context = {}, logUrl, todayCount) {
  const payload = { blocks: [] };
  payload.blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: ` :warning: *Errsole: ${notificationType}*` },
  });
  addSlackMetadataBlock(payload.blocks, 'App Name', context.appName);
  addSlackMetadataBlock(payload.blocks, 'Environment Name', context.environmentName);
  addSlackMetadataBlock(payload.blocks, 'Server Name', context.serverName);
  payload.blocks.push({
    type: 'rich_text',
    elements: [{
      type: 'rich_text_preformatted',
      elements: [{ type: 'text', text: message }],
    }],
  });

  if (todayCount) {
    const subject = notificationType === 'Alert' ? 'alert' : 'error';
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This ${subject} has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`
      },
    });
  }
  if (logUrl) {
    payload.blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `<${logUrl}|Click here> to view the logs in the Errsole dashboard.` },
    });
  }
  if (notificationType === 'Alert') {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._',
      },
    });
  } else if (notificationType !== 'Test') {
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

async function getLogUrl(storage, logId, createdAt) {
  const result = await storage.getConfig(ALERT_URL_CONFIG_KEY);
  if (!result || !result.item || !logId) return undefined;
  const { url } = JSON.parse(result.item.value);
  return `${url}#/logs?errsole_log_id=${logId}&timestamp=${timestampForLog(createdAt)}`;
}

const SlackService = {
  async sendAlert(message, notificationType, context = {}, logId, todayCount, createdAt) {
    try {
      const storage = getStorageConnection();
      const result = await storage.getConfig(SLACK_CONFIG_KEY);
      if (!result || !result.item) return false;

      const settings = JSON.parse(result.item.value);
      if (!settings.status) return false;

      const logUrl = await getLogUrl(storage, logId, createdAt);
      const payload = buildSlackMessage(message, notificationType, context, logUrl, todayCount);
      payload.username = settings.username || 'Errsole';
      payload.icon_url = settings.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

      try {
        await Promise.race([
          axios.post(settings.url, payload),
          delayRejection('Slack send timed out'),
        ]);
      } catch {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send slack alert:', error);
      return false;
    }
  },
};

const EmailService = {
  transporter: null,

  async emailTransport() {
    try {
      if (this.transporter !== null) return;
      const storage = getStorageConnection();
      const result = await storage.getConfig(EMAIL_CONFIG_KEY);
      if (!result || !result.item) return;
      const settings = JSON.parse(result.item.value);
      this.transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10,
        host: settings.host,
        port: parseInt(settings.port),
        secure: parseInt(settings.port) === 465,
        auth: { user: settings.username, pass: settings.password },
      });
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, notificationType, context = {}, logId, todayCount, createdAt) {
    try {
      await this.emailTransport();
      if (this.transporter === null) return false;

      const storage = getStorageConnection();
      const result = await storage.getConfig(EMAIL_CONFIG_KEY);
      if (!result || !result.item) return false;
      const settings = JSON.parse(result.item.value);
      if (!settings.status) return false;

      const logUrl = await getLogUrl(storage, logId, createdAt);
      let subject = `Errsole: ${notificationType}`;
      let metadata = '';
      if (context.appName && context.environmentName) {
        subject += ` (${context.appName} app, ${context.environmentName} environment)`;
        metadata = `<p><b>App Name:</b> ${context.appName}</p>\n          <p><b>Environment Name:</b> ${context.environmentName}</p>`;
      } else if (context.appName) {
        subject += ` (${context.appName} app)`;
        metadata = `<p><b>App Name:</b> ${context.appName}</p>`;
      } else if (context.environmentName) {
        subject += ` (${context.environmentName} environment)`;
        metadata = `<p><b>Environment Name:</b> ${context.environmentName}</p>`;
      }
      if (context.serverName) metadata += `<p><b>Server Name:</b> ${context.serverName}</p>`;

      let html = `${metadata}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
      if (todayCount) {
        const type = notificationType === 'Alert' ? 'alert' : 'error';
        html += `<p>This ${type} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
      }
      if (logUrl) html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      if (notificationType === 'Alert') {
        html += '<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>';
      } else {
        html += '<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>';
      }

      try {
        await Promise.race([
          this.transporter.sendMail({
            from: settings.sender,
            to: settings.receivers,
            subject,
            html,
          }),
          delayRejection('Email send timed out'),
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

async function checkDuplicateAlert(message, context, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const stringify = value => {
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const storage = getStorageConnection();
  if (storage && storage.insertNotificationItem) {
    const hashInput = `${stringify(message)}|${stringify(context)}`;
    const notification = {
      errsole_id: errsoleId,
      hashed_message: crypto.createHash('sha256').update(hashInput).digest('hex'),
      hostname: context.serverName,
    };
    try {
      const result = await storage.insertNotificationItem(notification);
      if (result) {
        todayCount = result.todayNotificationCount;
        const previous = result.previousNotificationItem;
        if (previous) {
          const now = new Date();
          const previousDate = new Date(previous.created_at);
          isDuplicateAlert = now.getUTCFullYear() === previousDate.getUTCFullYear()
            && now.getUTCMonth() === previousDate.getUTCMonth()
            && now.getUTCDate() === previousDate.getUTCDate()
            && now.getUTCHours() === previousDate.getUTCHours();
        }
      }
    } catch (error) {
      console.error('Error inserting notification item:', error);
      return false;
    }
  }
  return { isDuplicateAlert, todayCount };
}

const Alerts = {
  async customLoggerAlert(message, context, errsoleId, createdAt) {
    try {
      const { isDuplicateAlert, todayCount } = await checkDuplicateAlert(message, context, errsoleId);
      if (isDuplicateAlert) return false;
      await SlackService.sendAlert(message, 'Alert', context, errsoleId, todayCount, createdAt);
      await EmailService.sendAlert(message, 'Alert', context, errsoleId, todayCount, createdAt);
      return true;
    } catch (error) {
      console.error('Error in customLoggerAlert:', error);
      return false;
    }
  },

  async handleUncaughtExceptions(message, context, errsoleId, createdAt) {
    try {
      const { isDuplicateAlert, todayCount } = await checkDuplicateAlert(message, context, errsoleId);
      if (isDuplicateAlert) return false;
      await SlackService.sendAlert(message, 'Uncaught Exception', context, errsoleId, todayCount, createdAt);
      await EmailService.sendAlert(message, 'Uncaught Exception', context, errsoleId, todayCount, createdAt);
      return true;
    } catch (error) {
      console.error('Error in handleUncaughtExceptions:', error);
      return false;
    }
  },

  async testSlackAlert(message, title) {
    try {
      return await SlackService.sendAlert(message, 'Test', title);
    } catch (error) {
      console.error('Error in testSlackAlert:', error);
      return false;
    }
  },

  async testEmailAlert(message, title) {
    try {
      return await EmailService.sendAlert(message, 'Test', title);
    } catch (error) {
      console.error('Error in testEmailAlert:', error);
      return false;
    }
  },

  async clearEmailTransport() {
    EmailService.transporter = null;
    return true;
  },

  SlackService,
  EmailService,
};

function serialize(response, value) {
  response.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, value));
}

function sendError(response, error) {
  if (error) console.error(error);
  response.status(500).send({
    errors: [{
      error: INTERNAL_ERROR,
      message: error && error.message ? error.message : UNEXPECTED_ERROR,
    }],
  });
}

function parseConfigItem(result) {
  if (result && result.item) result.item.value = JSON.parse(result.item.value);
  return result;
}

exports.checkUpdates = async (_request, response) => {
  try {
    const latestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const latestStorageVersion = await NPMUpdates.fetchLatestVersion(storage.name);
    serialize(response, {
      name: packageJson.name,
      version: packageJson.version,
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

exports.getSlackDetails = async (_request, response) => {
  try {
    const result = parseConfigItem(await getStorageConnection().getConfig(SLACK_CONFIG_KEY));
    if (result && result.item) delete result.item.value.url;
    serialize(response, result && result.item ? result.item : {});
  } catch (error) {
    sendError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    if (!helpers.SlackUrl(url)) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have sent a url which is not a slack url.' }],
      });
    }
    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);
    if (!existing || existing.item) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have already added a webhook url for slack.' }],
      });
    }
    const result = parseConfigItem(await storage.setConfig(SLACK_CONFIG_KEY, JSON.stringify({
      url,
      username: 'Errsole',
      icon_url: 'https://avatars.githubusercontent.com/u/84983840',
      status: true,
    })));
    if (!result || !result.item) return sendError(response);
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const current = await storage.getConfig(SLACK_CONFIG_KEY);
    if (!current || !current.item) return sendError(response);

    let settings;
    try {
      settings = JSON.parse(current.item.value);
      settings.status = JSON.parse(status);
    } catch (error) {
      sendError(response, error);
    }
    current.item.value.status = JSON.parse(status);
    const result = parseConfigItem(await storage.setConfig(SLACK_CONFIG_KEY, JSON.stringify(settings)));
    if (!result || !result.item) return sendError(response);
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.deleteSlackDetails = async (_request, response) => {
  try {
    const deleted = await getStorageConnection().deleteConfig(SLACK_CONFIG_KEY);
    if (!deleted) return sendError(response);
    serialize(response, { data: 'slack integration has been removed' });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getEmailDetails = async (_request, response) => {
  try {
    const result = parseConfigItem(await getStorageConnection().getConfig(EMAIL_CONFIG_KEY));
    if (result && result.item) delete result.item.value.url;
    serialize(response, result && result.item ? result.item : {});
  } catch (error) {
    sendError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const { sender, host, port, username, password, receivers } = helpers.extractAttributes(request.body);
    const settings = { sender, host, port, username, password, receivers, status: true };
    const result = parseConfigItem(await getStorageConnection().setConfig(EMAIL_CONFIG_KEY, JSON.stringify(settings)));
    if (!result || !result.item) return sendError(response);
    await Alerts.clearEmailTransport();
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const current = await storage.getConfig(EMAIL_CONFIG_KEY);
    if (!current || !current.item) return sendError(response);

    let settings;
    try {
      settings = JSON.parse(current.item.value);
      settings.status = JSON.parse(status);
    } catch (error) {
      sendError(response, error);
    }
    current.item.value.status = JSON.parse(status);
    const result = parseConfigItem(await storage.setConfig(EMAIL_CONFIG_KEY, JSON.stringify(settings)));
    if (!result || !result.item) return sendError(response);
    await Alerts.clearEmailTransport();
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const deleted = await getStorageConnection().deleteConfig(EMAIL_CONFIG_KEY);
    if (!deleted) return sendError(response);
    serialize(response, { url });
  } catch (error) {
    sendError(response, error);
  }
};

exports.testSlackNotification = async (_request, response) => {
  try {
    const success = await Alerts.testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification',
    );
    serialize(response, { success });
  } catch (error) {
    sendError(response, error);
  }
};

exports.testEmailNotification = async (_request, response) => {
  try {
    const success = await Alerts.testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification',
    );
    serialize(response, { success });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getAlertUrlDetails = async (_request, response) => {
  try {
    const result = parseConfigItem(await getStorageConnection().getConfig(ALERT_URL_CONFIG_KEY));
    serialize(response, result && result.item ? result.item : {});
  } catch (error) {
    sendError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const result = parseConfigItem(await getStorageConnection().setConfig(
      ALERT_URL_CONFIG_KEY,
      JSON.stringify({ url }),
    ));
    if (!result || !result.item) return sendError(response);
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};
