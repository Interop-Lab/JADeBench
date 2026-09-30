'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

let storageConnection = null;

function initializeStorageConnection(connection) {
  if (!storageConnection) {
    storageConnection = connection;
  }
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

function valueForHash(value) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function checkAlertStatus(message, server, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const connection = getStorageConnection();

  if (connection && connection.insertNotificationItem) {
    const source = `${valueForHash(message)}|${valueForHash(server)}`;
    const notification = {
      errsole_id: errsoleId,
      hashed_message: crypto.createHash('sha256').update(source).digest('hex'),
      hostname: server.serverName,
    };

    try {
      const result = await connection.insertNotificationItem(notification);
      if (result) {
        const previous = result.previousNotificationItem;
        todayCount = result.todayNotificationCount;
        if (previous) {
          const now = new Date();
          const createdAt = new Date(previous.created_at);
          isDuplicateAlert =
            now.getUTCFullYear() === createdAt.getUTCFullYear() &&
            now.getUTCMonth() === createdAt.getUTCMonth() &&
            now.getUTCDate() === createdAt.getUTCDate() &&
            now.getUTCHours() === createdAt.getUTCHours();
        }
      }
    } catch (error) {
      console.error('Error inserting notification item:', error);
      return false;
    }
  }

  return { isDuplicateAlert, todayCount };
}

function roundUpToNextSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds() > 0) {
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
  }
  return date;
}

function buildDashboardUrl(config, errsoleLogId, timestamp) {
  if (!config || !config.item || !errsoleLogId) return undefined;
  const { url } = JSON.parse(config.item.value);
  const date = timestamp
    ? roundUpToNextSecond(timestamp)
    : new Date(Date.now() + 2000);
  return `${url}#/logs?errsole_log_id=${errsoleLogId}&timestamp=${date.toISOString()}`;
}

function blockKit(message, alertType, server = {}, dashboardUrl, todayCount) {
  const payload = { blocks: [] };
  payload.blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: ` :warning: *Errsole: ${alertType}*` },
  });

  const addLabel = (label, text) => {
    payload.blocks.push({
      type: 'rich_text',
      elements: [{
        type: 'rich_text_section',
        elements: [
          { type: 'text', text: label, style: { bold: true } },
          { type: 'text', text },
        ],
      }],
    });
  };

  if (server.appName) addLabel('App Name: ', server.appName);
  if (server.environmentName) addLabel('Environment Name: ', server.environmentName);
  if (server.serverName) addLabel('Server Name: ', server.serverName);

  payload.blocks.push({
    type: 'rich_text',
    elements: [{
      type: 'rich_text_preformatted',
      elements: [{ type: 'text', text: message }],
    }],
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

function timeoutAfter(message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), 5000);
  });
}

const SlackService = {
  async sendAlert(message, alertType, server, errsoleLogId, todayCount, timestamp) {
    try {
      const connection = getStorageConnection();
      const integrationRecord = await connection.getConfig('slackIntegration');
      if (!integrationRecord || !integrationRecord.item) return false;

      const integration = JSON.parse(integrationRecord.item.value);
      if (!integration.status) return false;

      const alertUrlRecord = await connection.getConfig('alertUrl');
      const dashboardUrl = buildDashboardUrl(alertUrlRecord, errsoleLogId, timestamp);
      const payload = blockKit(message, alertType, server, dashboardUrl, todayCount);
      payload.username = integration.username || 'Errsole';
      payload.icon_url = integration.icon_url ||
        'https://avatars.githubusercontent.com/u/84983840';

      try {
        await Promise.race([
          axios.post(integration.url, payload),
          timeoutAfter('Slack send timed out'),
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
      if (this.transporter === null) {
        const connection = getStorageConnection();
        const record = await connection.getConfig('emailIntegration');
        if (record && record.item) {
          const config = JSON.parse(record.item.value);
          const port = parseInt(config.port);
          this.transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: config.host,
            port,
            secure: port === 465,
            auth: { user: config.username, pass: config.password },
          });
        }
      }
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, server, errsoleLogId, todayCount, timestamp) {
    try {
      await this.emailTransport();
      if (this.transporter === null) return false;

      const connection = getStorageConnection();
      const integrationRecord = await connection.getConfig('emailIntegration');
      if (!integrationRecord || !integrationRecord.item) return false;

      const integration = JSON.parse(integrationRecord.item.value);
      if (!integration.status) return false;

      const alertUrlRecord = await connection.getConfig('alertUrl');
      const dashboardUrl = buildDashboardUrl(alertUrlRecord, errsoleLogId, timestamp);

      let subject = `Errsole: ${alertType}`;
      let details = '';
      if (server.appName && server.environmentName) {
        subject += ` (${server.appName} app, ${server.environmentName} environment)`;
        details = `<p><b>App Name:</b> ${server.appName}</p>\n          <p><b>Environment Name:</b> ${server.environmentName}</p>`;
      } else if (server.appName) {
        subject += ` (${server.appName} app)`;
        details = `<p><b>App Name:</b> ${server.appName}</p>`;
      } else if (server.environmentName) {
        subject += ` (${server.environmentName} environment)`;
        details = `<p><b>Environment Name:</b> ${server.environmentName}</p>`;
      }
      if (server.serverName) {
        details += `<p><b>Server Name:</b> ${server.serverName}</p>`;
      }

      let html = `${details}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
      if (todayCount) {
        const item = alertType === 'Alert' ? 'alert' : 'error';
        html += `<p>This ${item} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
      }
      if (dashboardUrl) {
        html += `<p><a href="${dashboardUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }

      const item = alertType === 'Alert' ? 'alert' : 'error';
      html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this ${item} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;

      const send = this.transporter.sendMail({
        from: integration.sender,
        to: integration.receivers,
        subject,
        html,
      });
      try {
        await Promise.race([send, timeoutAfter('Email send timed out')]);
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

async function sendDeduplicatedAlert(message, alertType, server, errsoleId, timestamp) {
  const status = await checkAlertStatus(message, server, errsoleId);
  if (!status || status.isDuplicateAlert) return false;
  await SlackService.sendAlert(message, alertType, server, errsoleId, status.todayCount, timestamp);
  await EmailService.sendAlert(message, alertType, server, errsoleId, status.todayCount, timestamp);
  return true;
}

exports.customLoggerAlert = async function customLoggerAlert(
  message,
  server,
  errsoleId,
  timestamp,
) {
  try {
    return await sendDeduplicatedAlert(message, 'Custom Logger', server, errsoleId, timestamp);
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function handleUncaughtExceptions(
  message,
  server,
  errsoleId,
  timestamp,
) {
  try {
    return await sendDeduplicatedAlert(message, 'Uncaught Exception', server, errsoleId, timestamp);
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};

exports.testSlackAlert = async function testSlackAlert(message, server) {
  try {
    return await SlackService.sendAlert(message, 'Test', server);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};

exports.testEmailAlert = async function testEmailAlert(message, server) {
  try {
    return await EmailService.sendAlert(message, 'Test', server);
  } catch (error) {
    console.error('Error in testEmailAlert:', error);
    return false;
  }
};

exports.clearEmailTransport = async function clearEmailTransport() {
  EmailService.transporter = null;
  return true;
};

exports.SlackService = SlackService;
exports.EmailService = EmailService;
