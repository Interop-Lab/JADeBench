'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

let storageConnection = null;

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

function serialize(value) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function roundUpToNextSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds() > 0) date.setSeconds(date.getSeconds() + 1);
  date.setMilliseconds(0);
  return date;
}

async function checkAlertStatus(error, context, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const storage = getStorageConnection();

  if (!storage || !storage.insertNotificationItem) {
    return { isDuplicateAlert, todayCount };
  }

  const hashedMessage = crypto
    .createHash('sha256')
    .update(`${serialize(error)}|${serialize(context)}`)
    .digest('hex');

  try {
    const result = await storage.insertNotificationItem({
      errsole_id: errsoleId,
      hashed_message: hashedMessage,
      serverName: context.serverName,
    });

    if (!result) return { isDuplicateAlert, todayCount };
    todayCount = result.todayNotificationCount;

    if (result.previousNotificationItem) {
      const now = new Date();
      const previous = new Date(result.previousNotificationItem.created_at);
      isDuplicateAlert =
        now.getUTCFullYear() === previous.getUTCFullYear() &&
        now.getUTCMonth() === previous.getUTCMonth() &&
        now.getUTCDate() === previous.getUTCDate() &&
        now.getUTCHours() === previous.getUTCHours();
    }
  } catch (error) {
    console.error('Error inserting notification item:', error);
  }

  return { isDuplicateAlert, todayCount };
}

function notificationNote(kind) {
  return `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this ${kind} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
}

function blockKit(error, alertType, context = {}, alertUrl, todayCount) {
  const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: ` :warning: *Errsole: ${alertType}*` } },
  ];
  for (const [label, value] of [
    ['App Name: ', context.appName],
    ['Environment Name: ', context.environmentName],
    ['Server Name: ', context.serverName],
  ]) {
    if (!value) continue;
    blocks.push({
      type: 'rich_text',
      elements: [{
        type: 'rich_text_section',
        elements: [
          { type: 'text', text: label, style: { bold: true } },
          { type: 'text', text: value },
        ],
      }],
    });
  }
  blocks.push({
    type: 'rich_text',
    elements: [{ type: 'rich_text_preformatted', elements: [{ type: 'text', text: error }] }],
  });
  if (todayCount) {
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This ${noun} has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`,
      },
    });
  }
  if (alertUrl) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `<${alertUrl}|Click here> to view the logs in Errsole dashboard.` },
    });
  }
  if (alertType !== 'Test') {
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_Note:_\n• _You will not receive another notification for this ${noun} on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._`,
      },
    });
  }
  blocks.push({ type: 'divider' });
  return { blocks };
}

const SlackService = {
  async sendAlert(error, alertType, context = {}, errsoleId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const integrationItem = await storage.getConfig('slackIntegration');
      if (!integrationItem || !integrationItem.item) return false;

      const integration = JSON.parse(integrationItem.item.value);
      if (!integration.status) return false;

      let alertUrl;
      const alertUrlItem = await storage.getConfig('alertUrl');
      if (alertUrlItem && alertUrlItem.item && errsoleId) {
        const configuredUrl = JSON.parse(alertUrlItem.item.value).url;
        const alertTime = timestamp
          ? roundUpToNextSecond(timestamp).toISOString()
          : new Date(Date.now() + 2000).toISOString();
        alertUrl = `${configuredUrl}#/logs?errsole_log_id=${errsoleId}&timestamp=${alertTime}`;
      }

      const payload = blockKit(error, alertType, context, alertUrl, todayCount);
      payload.username = integration.username || 'Errsole';
      payload.icon_url = integration.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

      const request = axios.post(integration.url, payload);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Slack send timed out')), 5000);
      });
      try {
        await Promise.race([request, timeout]);
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
        const storage = getStorageConnection();
        const item = await storage.getConfig('emailIntegration');
        if (item && item.item) {
          const integration = JSON.parse(item.item.value);
          const port = parseInt(integration.port);
          this.transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: integration.host,
            port,
            secure: port === 465,
            auth: {
              user: integration.username,
              pass: integration.password,
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(error, alertType, context = {}, errsoleId, todayCount, timestamp) {
    try {
      await EmailService.emailTransport();
      if (this.transporter === null) return false;

      const storage = getStorageConnection();
      const item = await storage.getConfig('emailIntegration');
      if (!item || !item.item) return false;
      const integration = JSON.parse(item.item.value);
      if (!integration.status) return false;

      let alertUrl;
      const alertUrlItem = await storage.getConfig('alertUrl');
      if (alertUrlItem && alertUrlItem.item && errsoleId) {
        const configuredUrl = JSON.parse(alertUrlItem.item.value).url;
        const alertTime = timestamp
          ? roundUpToNextSecond(timestamp).toISOString()
          : new Date(Date.now() + 2000).toISOString();
        alertUrl = `${configuredUrl}#/logs?errsole_log_id=${errsoleId}&timestamp=${alertTime}`;
      }

      let subject = `Errsole: ${alertType}`;
      let details = '';
      if (context.appName && context.environmentName) {
        subject += ` (${context.appName} app, ${context.environmentName} environment)`;
        details = `<p><b>App Name:</b> ${context.appName}</p>\n          <p><b>Environment Name:</b> ${context.environmentName}</p>`;
      } else if (context.appName) {
        subject += ` (${context.appName} app)`;
        details = `<p><b>App Name:</b> ${context.appName}</p>`;
      } else if (context.environmentName) {
        subject += ` (${context.environmentName} environment)`;
        details = `<p><b>Environment Name:</b> ${context.environmentName}</p>`;
      }
      if (context.serverName) details += `<p><b>Server Name:</b> ${context.serverName}</p>`;

      let html = `${details}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${error}</pre>`;
      if (todayCount) {
        const noun = alertType === 'Alert' ? 'alert' : 'error';
        html += `<p>This ${noun} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
      }
      if (alertUrl) {
        html += `<p><a href="${alertUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }
      if (alertType !== 'Test') {
        html += notificationNote(alertType === 'Alert' ? 'alert' : 'error');
      }

      const request = this.transporter.sendMail({
        from: integration.sender,
        to: integration.receivers,
        subject,
        html,
      });
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Email send timed out')), 5000);
      });
      try {
        await Promise.race([request, timeout]);
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

async function sendAlert(error, alertType, context, errsoleId, timestamp) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(error, context, errsoleId);
    if (isDuplicateAlert) return false;
    await SlackService.sendAlert(error, alertType, context, errsoleId, todayCount, timestamp);
    await EmailService.sendAlert(error, alertType, context, errsoleId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error(`Error in ${alertType}:`, error);
    return false;
  }
}

exports.customLoggerAlert = (error, context, errsoleId, timestamp) =>
  sendAlert(error, 'Alert', context, errsoleId, timestamp);

exports.handleUncaughtExceptions = (error, context, errsoleId, timestamp) =>
  sendAlert(error, 'Uncaught Exception', context, errsoleId, timestamp);

exports.testSlackAlert = async function testSlackAlert(context, error) {
  try {
    return await SlackService.sendAlert(context, 'Test', error);
  } catch (exception) {
    console.error('Error in testSlackAlert:', exception);
    return false;
  }
};

exports.testEmailAlert = async function testEmailAlert(context, error) {
  try {
    return await EmailService.sendAlert(context, 'Test', error);
  } catch (exception) {
    console.error('Error in testEmailAlert:', exception);
    return false;
  }
};

exports.clearEmailTransport = async function clearEmailTransport() {
  EmailService.transporter = null;
  return true;
};

exports.SlackService = SlackService;
exports.EmailService = EmailService;
