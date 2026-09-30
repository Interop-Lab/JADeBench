'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const SEND_TIMEOUT_MS = 5000;
const LOG_LINK_OFFSET_MS = 2000;
const DEFAULT_SLACK_USERNAME = 'Errsole';
const DEFAULT_SLACK_ICON_URL =
  'https://avatars.githubusercontent.com/u/84983840';

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

function serializeAlertValue(value) {
  if (typeof value === 'string') return value;

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
    const serializedMessage = serializeAlertValue(message);
    const serializedMetadata = serializeAlertValue(metadata);
    const combinedMessage = `${serializedMessage}|${serializedMetadata}`;
    const hashedMessage = crypto
      .createHash('sha256')
      .update(combinedMessage)
      .digest('hex');

    const notificationItem = {
      errsole_id: errsoleId,
      hashed_message: hashedMessage,
      hostname: metadata.serverName,
    };

    try {
      const insertionResult = await connection.insertNotificationItem(
        notificationItem,
      );

      if (insertionResult) {
        const previousNotification = insertionResult.previousNotificationItem;
        todayCount = insertionResult.todayNotificationCount;

        if (previousNotification) {
          const now = new Date();
          const previousCreatedAt = new Date(previousNotification.created_at);
          if (
            now.getUTCFullYear() === previousCreatedAt.getUTCFullYear() &&
            now.getUTCMonth() === previousCreatedAt.getUTCMonth() &&
            now.getUTCDate() === previousCreatedAt.getUTCDate() &&
            now.getUTCHours() === previousCreatedAt.getUTCHours()
          ) {
            isDuplicateAlert = true;
          }
        }
      }
    } catch (error) {
      console.error('Error inserting notification item:', error);
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

function textElement(text, bold = false) {
  const element = { type: 'text', text };
  if (bold) element.style = { bold: true };
  return element;
}

function richTextBlock(label, value) {
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

function markdownSection(text) {
  return {
    type: 'section',
    text: { type: 'mrkdwn', text },
  };
}

function buildSlackBlocks(
  message,
  alertType,
  metadata = {},
  alertUrl,
  todayCount,
) {
  const payload = { blocks: [] };

  payload.blocks.push(
    markdownSection(` :warning: *Errsole: ${alertType}*`),
  );

  if (metadata.appName) {
    payload.blocks.push(richTextBlock('App Name: ', metadata.appName));
  }
  if (metadata.environmentName) {
    payload.blocks.push(
      richTextBlock('Environment Name: ', metadata.environmentName),
    );
  }
  if (metadata.serverName) {
    payload.blocks.push(richTextBlock('Server Name: ', metadata.serverName));
  }

  payload.blocks.push({
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_preformatted',
        elements: [textElement(message)],
      },
    ],
  });

  if (todayCount) {
    const occurrence = `${todayCount} time${todayCount > 1 ? 's' : ''}`;
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    payload.blocks.push(
      markdownSection(`This ${noun} has occurred *${occurrence} today*.`),
    );
  }

  if (alertUrl) {
    payload.blocks.push(
      markdownSection(
        `<${alertUrl}|Click here> to view the logs in the Errsole dashboard.`,
      ),
    );
  }

  if (alertType === 'Alert') {
    payload.blocks.push(
      markdownSection(
        '_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._',
      ),
    );
  } else if (alertType !== 'Test') {
    payload.blocks.push(
      markdownSection(
        '_Note:_\n• _You will not receive another notification for this error on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._',
      ),
    );
  }

  payload.blocks.push({ type: 'divider' });
  return payload;
}

function alertLogUrl(metadata, errsoleLogId, timestamp) {
  if (!metadata || !metadata.item || !errsoleLogId) return undefined;

  const alertUrlConfig = JSON.parse(metadata.item.value);
  const logTimestamp = timestamp
    ? roundUpToNextSecond(timestamp).toISOString()
    : new Date(Date.now() + LOG_LINK_OFFSET_MS).toISOString();

  return `${alertUrlConfig.url}#/logs?errsole_log_id=${errsoleLogId}&timestamp=${logTimestamp}`;
}

const SlackService = {
  async sendAlert(
    message,
    alertType,
    metadata,
    errsoleLogId,
    todayCount,
    timestamp,
  ) {
    try {
      const connection = getStorageConnection();
      const storedIntegration = await connection.getConfig('slackIntegration');
      if (!storedIntegration || !storedIntegration.item) return false;

      const integration = JSON.parse(storedIntegration.item.value);
      if (!integration.status) return false;

      const storedAlertUrl = await connection.getConfig('alertUrl');
      const logUrl = alertLogUrl(
        storedAlertUrl,
        errsoleLogId,
        timestamp,
      );
      const payload = buildSlackBlocks(
        message,
        alertType,
        metadata,
        logUrl,
        todayCount,
      );
      payload.username = integration.username || DEFAULT_SLACK_USERNAME;
      payload.icon_url = integration.icon_url || DEFAULT_SLACK_ICON_URL;

      const request = axios.post(integration.url, payload);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Slack send timed out')), SEND_TIMEOUT_MS);
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
        const connection = getStorageConnection();
        const storedIntegration = await connection.getConfig('emailIntegration');
        if (storedIntegration && storedIntegration.item) {
          const integration = JSON.parse(storedIntegration.item.value);
          this.transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: integration.host,
            port: parseInt(integration.port),
            secure: parseInt(integration.port) === 465,
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

  async sendAlert(
    message,
    alertType,
    metadata,
    errsoleLogId,
    todayCount,
    timestamp,
  ) {
    try {
      await EmailService.emailTransport();
      if (this.transporter === null) return false;

      const connection = getStorageConnection();
      const storedIntegration = await connection.getConfig('emailIntegration');
      if (!storedIntegration || !storedIntegration.item) return false;

      const integration = JSON.parse(storedIntegration.item.value);
      if (!integration.status) return false;

      const storedAlertUrl = await connection.getConfig('alertUrl');
      const logUrl = alertLogUrl(
        storedAlertUrl,
        errsoleLogId,
        timestamp,
      );

      let subject;
      let metadataHtml = '';
      if (metadata.appName && metadata.environmentName) {
        subject = `Errsole: ${alertType} (${metadata.appName} app, ${metadata.environmentName} environment)`;
        metadataHtml = `<p><b>App Name:</b> ${metadata.appName}</p>\n          <p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
      } else if (metadata.appName) {
        subject = `Errsole: ${alertType} (${metadata.appName} app)`;
        metadataHtml = `<p><b>App Name:</b> ${metadata.appName}</p>`;
      } else if (metadata.environmentName) {
        subject = `Errsole: ${alertType} (${metadata.environmentName} environment)`;
        metadataHtml = `<p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
      } else {
        subject = `Errsole: ${alertType}`;
      }

      if (metadata.serverName) {
        metadataHtml += `<p><b>Server Name:</b> ${metadata.serverName}</p>`;
      }

      let html = `${metadataHtml}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
      if (todayCount) {
        const plural = todayCount > 1 ? 's' : '';
        const noun = alertType === 'Alert' ? 'alert' : 'error';
        html += `<p>This ${noun} has occurred <b>${todayCount} time${plural} today</b>.</p>`;
      }
      if (logUrl) {
        html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }
      if (alertType === 'Alert') {
        html += '<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>';
      } else {
        html += '<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>';
      }

      const request = this.transporter.sendMail({
        from: integration.sender,
        to: integration.receivers,
        subject,
        html,
      });
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Email send timed out')), SEND_TIMEOUT_MS);
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

async function customLoggerAlert(
  message,
  metadata,
  errsoleId,
  timestamp,
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      metadata,
      errsoleId,
    );
    if (isDuplicateAlert) return false;

    await SlackService.sendAlert(
      message,
      'Alert',
      metadata,
      errsoleId,
      todayCount,
      timestamp,
    );
    await EmailService.sendAlert(
      message,
      'Alert',
      metadata,
      errsoleId,
      todayCount,
      timestamp,
    );
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
}

async function handleUncaughtExceptions(
  message,
  metadata,
  errsoleId,
  timestamp,
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      metadata,
      errsoleId,
    );
    if (isDuplicateAlert) return false;

    await SlackService.sendAlert(
      message,
      'Uncaught Exception',
      metadata,
      errsoleId,
      todayCount,
      timestamp,
    );
    await EmailService.sendAlert(
      message,
      'Uncaught Exception',
      metadata,
      errsoleId,
      todayCount,
      timestamp,
    );
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
}

async function testSlackAlert(message, metadata) {
  try {
    return await SlackService.sendAlert(message, 'Test', metadata);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
}

async function testEmailAlert(message, metadata) {
  try {
    return await EmailService.sendAlert(message, 'Test', metadata);
  } catch (error) {
    console.error('Error in testEmailAlert:', error);
    return false;
  }
}

async function clearEmailTransport() {
  EmailService.transporter = null;
  return true;
}

module.exports = {
  customLoggerAlert,
  handleUncaughtExceptions,
  testSlackAlert,
  testEmailAlert,
  clearEmailTransport,
  SlackService,
  EmailService,
};
