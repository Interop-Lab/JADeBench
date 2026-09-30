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

const SEND_TIMEOUT_MS = 5000;
const DEFAULT_DASHBOARD_TIMESTAMP_OFFSET_MS = 2000;
const ALERT_TITLE = 'Alert';
const TEST_TITLE = 'Test';
const UNCAUGHT_EXCEPTION_TITLE = 'Uncaught Exception';

function rejectAfterTimeout(message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), SEND_TIMEOUT_MS);
  });
}

function roundUpToNextSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds() > 0) {
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
  }
  return date;
}

function buildDashboardUrl(alertUrlConfig, logId, timestamp) {
  const date = timestamp
    ? roundUpToNextSecond(timestamp)
    : new Date(Date.now() + DEFAULT_DASHBOARD_TIMESTAMP_OFFSET_MS);
  return `${alertUrlConfig.url}#/logs?errsole_log_id=${logId}&timestamp=${date.toISOString()}`;
}

function serializeForHash(value) {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function checkAlertStatus(message, metadata, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const connection = getStorageConnection();

  if (connection && connection.insertNotificationItem) {
    const hashInput = `${serializeForHash(message)}|${serializeForHash(metadata)}`;
    const hashedMessage = crypto.createHash('sha256').update(hashInput).digest('hex');
    const notification = {
      errsole_id: errsoleId,
      hashed_message: hashedMessage,
      hostname: metadata.serverName,
    };

    try {
      const result = await connection.insertNotificationItem(notification);
      if (result) {
        const previousNotification = result.previousNotificationItem;
        todayCount = result.todayNotificationCount;

        if (previousNotification) {
          const now = new Date();
          const previousDate = new Date(previousNotification.created_at);
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

function richTextField(label, value) {
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

function blockKit(message, title, metadata = {}, dashboardUrl, todayCount) {
  const payload = { blocks: [] };

  payload.blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: ` :warning: *Errsole: ${title}*` },
  });

  if (metadata.appName) {
    payload.blocks.push(richTextField('App Name: ', metadata.appName));
  }
  if (metadata.environmentName) {
    payload.blocks.push(richTextField('Environment Name: ', metadata.environmentName));
  }
  if (metadata.serverName) {
    payload.blocks.push(richTextField('Server Name: ', metadata.serverName));
  }

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
    const subject = title === ALERT_TITLE ? 'alert' : 'error';
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

  if (title === ALERT_TITLE) {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._',
      },
    });
  } else if (title !== TEST_TITLE) {
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

const SlackService = {};

SlackService.sendAlert = async function sendSlackAlert(
  message,
  title,
  metadata,
  logId,
  todayCount,
  timestamp,
) {
  try {
    const connection = getStorageConnection();
    const configItem = await connection.getConfig('slackIntegration');
    if (!configItem || !configItem.item) {
      return false;
    }

    const config = JSON.parse(configItem.item.value);
    if (!config.status) {
      return false;
    }

    const alertUrlItem = await connection.getConfig('alertUrl');
    let dashboardUrl;
    if (alertUrlItem && alertUrlItem.item && logId) {
      dashboardUrl = buildDashboardUrl(JSON.parse(alertUrlItem.item.value), logId, timestamp);
    }

    const payload = blockKit(message, title, metadata, dashboardUrl, todayCount);
    payload.username = config.username || 'Errsole';
    payload.icon_url = config.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

    try {
      await Promise.race([
        axios.post(config.url, payload),
        rejectAfterTimeout('Slack send timed out'),
      ]);
    } catch {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send slack alert:', error);
    return false;
  }
};

const EmailService = { transporter: null };

EmailService.emailTransport = async function emailTransport() {
  try {
    if (this.transporter === null) {
      const connection = getStorageConnection();
      const configItem = await connection.getConfig('emailIntegration');
      if (configItem && configItem.item) {
        const config = JSON.parse(configItem.item.value);
        this.transporter = nodemailer.createTransport({
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 10,
          host: config.host,
          port: parseInt(config.port),
          secure: parseInt(config.port) === 465,
          auth: {
            user: config.username,
            pass: config.password,
          },
        });
      }
    }
  } catch (error) {
    console.error('Failed to create email transporter: ', error);
    this.transporter = null;
  }
};

function buildEmailHeading(title, metadata) {
  let subject;
  let details = '';

  if (metadata.appName && metadata.environmentName) {
    subject = `Errsole: ${title} (${metadata.appName} app, ${metadata.environmentName} environment)`;
    details = `<p><b>App Name:</b> ${metadata.appName}</p>\n          <p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
  } else if (metadata.appName) {
    subject = `Errsole: ${title} (${metadata.appName} app)`;
    details = `<p><b>App Name:</b> ${metadata.appName}</p>`;
  } else if (metadata.environmentName) {
    subject = `Errsole: ${title} (${metadata.environmentName} environment)`;
    details = `<p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
  } else {
    subject = `Errsole: ${title}`;
  }

  if (metadata.serverName) {
    details += `<p><b>Server Name:</b> ${metadata.serverName}</p>`;
  }
  return { subject, details };
}

EmailService.sendAlert = async function sendEmailAlert(
  message,
  title,
  metadata,
  logId,
  todayCount,
  timestamp,
) {
  try {
    await EmailService.emailTransport();
    if (this.transporter === null) {
      return false;
    }

    const connection = getStorageConnection();
    const configItem = await connection.getConfig('emailIntegration');
    if (!configItem || !configItem.item) {
      return false;
    }

    const config = JSON.parse(configItem.item.value);
    if (!config.status) {
      return false;
    }

    const alertUrlItem = await connection.getConfig('alertUrl');
    let dashboardUrl;
    if (alertUrlItem && alertUrlItem.item && logId) {
      dashboardUrl = buildDashboardUrl(JSON.parse(alertUrlItem.item.value), logId, timestamp);
    }

    const { subject, details } = buildEmailHeading(title, metadata);
    let html = `${details}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;

    if (todayCount) {
      const subjectType = title === ALERT_TITLE ? 'alert' : 'error';
      html += `<p>This ${subjectType} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
    }
    if (dashboardUrl) {
      html += `<p><a href="${dashboardUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
    }

    const noteSubject = title === ALERT_TITLE ? 'alert' : 'error';
    html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this ${noteSubject} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;

    const mail = {
      from: config.sender,
      to: config.receivers,
      subject,
      html,
    };

    try {
      await Promise.race([
        this.transporter.sendMail(mail),
        rejectAfterTimeout('Email send timed out'),
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
};

exports.customLoggerAlert = async function customLoggerAlert(message, metadata, errsoleId, timestamp) {
  try {
    const status = await checkAlertStatus(message, metadata, errsoleId);
    const { isDuplicateAlert, todayCount } = status;
    if (isDuplicateAlert) {
      return false;
    }

    await SlackService.sendAlert(message, ALERT_TITLE, metadata, errsoleId, todayCount, timestamp);
    await EmailService.sendAlert(message, ALERT_TITLE, metadata, errsoleId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function handleUncaughtExceptions(
  message,
  metadata,
  errsoleId,
  timestamp,
) {
  try {
    const status = await checkAlertStatus(message, metadata, errsoleId);
    const { isDuplicateAlert, todayCount } = status;
    if (isDuplicateAlert) {
      return false;
    }

    await SlackService.sendAlert(message, UNCAUGHT_EXCEPTION_TITLE, metadata, errsoleId, todayCount, timestamp);
    await EmailService.sendAlert(message, UNCAUGHT_EXCEPTION_TITLE, metadata, errsoleId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};

exports.testSlackAlert = async function testSlackAlert(message, metadata) {
  try {
    return await SlackService.sendAlert(message, TEST_TITLE, metadata);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};

exports.testEmailAlert = async function testEmailAlert(message, metadata) {
  try {
    return await EmailService.sendAlert(message, TEST_TITLE, metadata);
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
