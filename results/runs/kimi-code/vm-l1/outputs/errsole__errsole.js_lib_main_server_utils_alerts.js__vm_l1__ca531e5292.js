'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

let storageConnection;

function initializeStorageConnection(connection) {
  storageConnection = connection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

function textElement(text, bold = false) {
  const element = { type: 'text', text };
  if (bold) element.style = { bold: true };
  return element;
}

function richTextLine(label, value) {
  return {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [textElement(label, true), textElement(value)],
      },
    ],
  };
}

function blockKit(message, alertType, application, logUrl, todayCount) {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ` :warning: *Errsole: ${alertType}*`,
      },
    },
  ];

  if (application.appName) {
    blocks.push(richTextLine('App Name: ', application.appName));
  }
  if (application.environmentName) {
    blocks.push(richTextLine('Environment Name: ', application.environmentName));
  }
  if (application.serverName) {
    blocks.push(richTextLine('Server Name: ', application.serverName));
  }

  blocks.push({
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_preformatted',
        elements: [textElement(message)],
      },
    ],
  });

  if (todayCount) {
    const occurrenceText = alertType === 'Alert'
      ? `This alert has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`
      : `This error has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`;
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: occurrenceText } });
  }

  if (logUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${logUrl}|Click here> to view the logs in the Errsole dashboard.`,
      },
    });
  }

  if (alertType !== 'Test') {
    const subject = alertType === 'Alert' ? 'alert' : 'error';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_Note:_\n• _You will not receive another notification for this ${subject} on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._`,
      },
    });
  }

  blocks.push({ type: 'divider' });
  return { blocks };
}

function normalizeMessage(message) {
  if (typeof message === 'string') return message;
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

async function checkAlertStatus(message, application, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;

  try {
    const storage = getStorageConnection();
    const normalizedMessage = normalizeMessage(message);
    const hashedMessage = crypto
      .createHash('sha256')
      .update(`${normalizedMessage}|${application.serverName}`)
      .digest('hex');

    const notification = await storage.insertNotificationItem({
      errsole_id: errsoleId,
      hashed_message: hashedMessage,
      hostname: application.serverName,
    });

    const previousNotification = notification.previousNotificationItem;
    todayCount = notification.todayNotificationCount;

    if (previousNotification) {
      const now = new Date();
      const previousDate = new Date(previousNotification.created_at);
      isDuplicateAlert =
        now.getUTCFullYear() === previousDate.getUTCFullYear() &&
        now.getUTCMonth() === previousDate.getUTCMonth() &&
        now.getUTCDate() === previousDate.getUTCDate() &&
        now.getUTCHours() === previousDate.getUTCHours();
    }
  } catch (error) {
    console.error('Error inserting notification item:', error);
  }

  return { isDuplicateAlert, todayCount };
}

function roundUpToNextSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds() > 0) {
    date.setSeconds(date.getSeconds() + 1);
  }
  date.setMilliseconds(0);
  return date;
}

const SlackService = {
  async sendAlert(message, alertType, application, errsoleId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const configItem = await storage.getConfig('slackIntegration');
      if (!configItem || !configItem.item) return false;

      const config = JSON.parse(configItem.item.value);
      if (!config.status) return false;

      const alertUrlItem = await storage.getConfig('alertUrl');
      let logUrl;
      if (alertUrlItem && alertUrlItem.item && errsoleId) {
        const alertUrl = JSON.parse(alertUrlItem.item.value);
        const linkTimestamp = timestamp
          ? roundUpToNextSecond(timestamp).toISOString()
          : new Date(Date.now() + 2000).toISOString();
        logUrl = `${alertUrl.url}#/logs?errsole_log_id=${errsoleId}&timestamp=${linkTimestamp}`;
      }

      const payload = blockKit(message, alertType, application, logUrl, todayCount);
      payload.username = config.username || 'Errsole';
      payload.icon_url = config.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

      const request = axios.post(config.url, payload);
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
      if (this.transporter !== null) return;
      const storage = getStorageConnection();
      const configItem = await storage.getConfig('emailIntegration');
      if (!configItem || !configItem.item) return;
      const config = JSON.parse(configItem.item.value);
      this.transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10,
        host: config.host,
        port: parseInt(config.port),
        secure: parseInt(config.port) === 465,
        auth: { user: config.username, pass: config.password },
      });
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, application, errsoleId, todayCount, timestamp) {
    try {
      await this.emailTransport();
      if (this.transporter === null) return false;

      const storage = getStorageConnection();
      const configItem = await storage.getConfig('emailIntegration');
      if (!configItem || !configItem.item) return false;
      const config = JSON.parse(configItem.item.value);
      if (!config.status) return false;

      const alertUrlItem = await storage.getConfig('alertUrl');
      let logUrl;
      if (alertUrlItem && alertUrlItem.item && errsoleId) {
        const alertUrl = JSON.parse(alertUrlItem.item.value);
        const linkTimestamp = timestamp
          ? roundUpToNextSecond(timestamp).toISOString()
          : new Date(Date.now() + 2000).toISOString();
        logUrl = `${alertUrl.url}#/logs?errsole_log_id=${errsoleId}&timestamp=${linkTimestamp}`;
      }

      let subject = `Errsole: ${alertType}`;
      let details = '';
      if (application.appName && application.environmentName) {
        subject += ` (${application.appName} app, ${application.environmentName} environment)`;
        details = `<p><b>App Name:</b> ${application.appName}</p>\n          <p><b>Environment Name:</b> ${application.environmentName}</p>`;
      } else if (application.appName) {
        subject += ` (${application.appName} app)`;
        details = `<p><b>App Name:</b> ${application.appName}</p>`;
      } else if (application.environmentName) {
        subject += ` (${application.environmentName} environment)`;
        details = `<p><b>Environment Name:</b> ${application.environmentName}</p>`;
      }
      if (application.serverName) details += `<p><b>Server Name:</b> ${application.serverName}</p>`;

      let html = `${details}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
      if (todayCount) {
        const noun = alertType === 'Alert' ? 'alert' : 'error';
        html += `<p>This ${noun} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
      }
      if (logUrl) html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      if (alertType !== 'Test') {
        const noun = alertType === 'Alert' ? 'alert' : 'error';
        html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this ${noun} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
      }

      const request = this.transporter.sendMail({
        from: config.sender,
        to: config.receivers,
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

exports.customLoggerAlert = async function customLoggerAlert(message, application, errsoleId, timestamp) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, application, errsoleId);
    if (isDuplicateAlert) return false;
    await SlackService.sendAlert(message, 'Alert', application, errsoleId, todayCount, timestamp);
    await EmailService.sendAlert(message, 'Alert', application, errsoleId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function handleUncaughtExceptions(message, application, errsoleId, timestamp) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, application, errsoleId);
    if (isDuplicateAlert) return false;
    await SlackService.sendAlert(message, 'Uncaught Exception', application, errsoleId, todayCount, timestamp);
    await EmailService.sendAlert(message, 'Uncaught Exception', application, errsoleId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};

exports.testSlackAlert = async function testSlackAlert(message, application) {
  try {
    return await SlackService.sendAlert(message, 'Test', application);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};

exports.testEmailAlert = async function testEmailAlert(message, application) {
  try {
    return await EmailService.sendAlert(message, 'Test', application);
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
