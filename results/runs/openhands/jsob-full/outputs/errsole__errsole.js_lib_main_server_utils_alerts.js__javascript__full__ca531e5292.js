'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const ALERT_TYPE = 'Alert';
const TEST_TYPE = 'Test';
const UNCAUGHT_EXCEPTION_TYPE = 'Uncaught Exception';
const SEND_TIMEOUT_MS = 5000;
const DASHBOARD_TIMESTAMP_OFFSET_MS = 2000;

const storageConnectionModule = (() => {
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

  return { initializeStorageConnection, getStorageConnection };
})();

const { getStorageConnection } = storageConnectionModule;

function timeoutAfter(message) {
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

function notificationTimestamp(originalTimestamp) {
  if (!originalTimestamp) {
    return new Date(Date.now() + DASHBOARD_TIMESTAMP_OFFSET_MS).toISOString();
  }
  return roundUpToNextSecond(originalTimestamp).toISOString();
}

function dashboardUrl(configuration, logId, originalTimestamp) {
  return `${configuration.url}#/logs?errsole_log_id=${logId}&timestamp=${notificationTimestamp(originalTimestamp)}`;
}

function pluralSuffix(count) {
  return count > 1 ? 's' : '';
}

function notificationNote(type) {
  const subject = type === ALERT_TYPE ? 'alert' : 'error';
  return (
    '_Note:_\n' +
    `• _You will not receive another notification for this ${subject} on this server within the current hour._\n` +
    '• _Errsole uses the UTC timezone in notifications._'
  );
}

function emailNotificationNote(type) {
  const subject = type === ALERT_TYPE ? 'alert' : 'error';
  return (
    '<br/><p style="margin:0px;font-size:small"><i>Note:' +
    '<ul style="margin:0px;padding:0px 5px;">' +
    `<li>You will not receive another notification for this ${subject} on this server within the current hour.</li>` +
    '<li>Errsole uses the UTC timezone in notifications.</li>' +
    '</ul></i></p>'
  );
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

function blockKit(message, type, metadata = {}, logUrl, todayCount) {
  const payload = { blocks: [] };

  payload.blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ` :warning: *Errsole: ${type}*`,
    },
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
    const subject = type === ALERT_TYPE ? 'alert' : 'error';
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This ${subject} has occurred *${todayCount} time${pluralSuffix(todayCount)} today*.`,
      },
    });
  }

  if (logUrl) {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${logUrl}|Click here> to view the logs in the Errsole dashboard.`,
      },
    });
  }

  if (type === ALERT_TYPE || type !== TEST_TYPE) {
    payload.blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: notificationNote(type) },
    });
  }

  payload.blocks.push({ type: 'divider' });
  return payload;
}

const SlackService = {
  async sendAlert(message, type, metadata, logId, todayCount, originalTimestamp) {
    try {
      const storageConnection = getStorageConnection();
      const integrationRecord = await storageConnection.getConfig('slackIntegration');

      if (!integrationRecord || !integrationRecord.item) {
        return false;
      }

      const integration = JSON.parse(integrationRecord.item.value);
      if (!integration.status) {
        return false;
      }

      let logUrl;
      const alertUrlRecord = await storageConnection.getConfig('alertUrl');
      if (alertUrlRecord && alertUrlRecord.item && logId) {
        logUrl = dashboardUrl(
          JSON.parse(alertUrlRecord.item.value),
          logId,
          originalTimestamp,
        );
      }

      const payload = blockKit(message, type, metadata, logUrl, todayCount);
      payload.username = integration.username || 'Errsole';
      payload.icon_url =
        integration.icon_url ||
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
        const storageConnection = getStorageConnection();
        const integrationRecord = await storageConnection.getConfig('emailIntegration');

        if (integrationRecord && integrationRecord.item) {
          const integration = JSON.parse(integrationRecord.item.value);
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

  async sendAlert(message, type, metadata, logId, todayCount, originalTimestamp) {
    try {
      await EmailService.emailTransport();
      if (this.transporter === null) {
        return false;
      }

      const storageConnection = getStorageConnection();
      const integrationRecord = await storageConnection.getConfig('emailIntegration');
      if (!integrationRecord || !integrationRecord.item) {
        return false;
      }

      const integration = JSON.parse(integrationRecord.item.value);
      if (!integration.status) {
        return false;
      }

      let logUrl;
      const alertUrlRecord = await storageConnection.getConfig('alertUrl');
      if (alertUrlRecord && alertUrlRecord.item && logId) {
        logUrl = dashboardUrl(
          JSON.parse(alertUrlRecord.item.value),
          logId,
          originalTimestamp,
        );
      }

      let subject;
      let metadataHtml = '';
      if (metadata.appName && metadata.environmentName) {
        subject = `Errsole: ${type} (${metadata.appName} app, ${metadata.environmentName} environment)`;
        metadataHtml =
          `<p><b>App Name:</b> ${metadata.appName}</p>\n          ` +
          `<p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
      } else if (metadata.appName) {
        subject = `Errsole: ${type} (${metadata.appName} app)`;
        metadataHtml = `<p><b>App Name:</b> ${metadata.appName}</p>`;
      } else if (metadata.environmentName) {
        subject = `Errsole: ${type} (${metadata.environmentName} environment)`;
        metadataHtml = `<p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
      } else {
        subject = `Errsole: ${type}`;
      }

      if (metadata.serverName) {
        metadataHtml += `<p><b>Server Name:</b> ${metadata.serverName}</p>`;
      }

      let html =
        metadataHtml +
        `<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;

      if (todayCount) {
        const occurrence = type === ALERT_TYPE ? 'alert' : 'error';
        html += `<p>This ${occurrence} has occurred <b>${todayCount} time${pluralSuffix(todayCount)} today</b>.</p>`;
      }
      if (logUrl) {
        html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }
      html += emailNotificationNote(type);

      const mailOptions = {
        from: integration.sender,
        to: integration.receivers,
        subject,
        html,
      };

      try {
        await Promise.race([
          this.transporter.sendMail(mailOptions),
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
  const storageConnection = getStorageConnection();

  if (storageConnection && storageConnection.insertNotificationItem) {
    const hashInput = `${serializeForHash(message)}|${serializeForHash(metadata)}`;
    const hashedMessage = crypto
      .createHash('sha256')
      .update(hashInput)
      .digest('hex');
    const notification = {
      errsole_id: errsoleId,
      hashed_message: hashedMessage,
      hostname: metadata.serverName,
    };

    try {
      const result = await storageConnection.insertNotificationItem(notification);
      if (result) {
        const previousNotification = result.previousNotificationItem;
        todayCount = result.todayNotificationCount;

        if (previousNotification) {
          const now = new Date();
          const previousDate = new Date(previousNotification.created_at);
          if (
            now.getUTCFullYear() === previousDate.getUTCFullYear() &&
            now.getUTCMonth() === previousDate.getUTCMonth() &&
            now.getUTCDate() === previousDate.getUTCDate() &&
            now.getUTCHours() === previousDate.getUTCHours()
          ) {
            isDuplicateAlert = true;
          }
        }
      }
    } catch (error) {
      console.error('Error inserting notification item:', error);
      return false;
    }
  }

  return { isDuplicateAlert, todayCount };
}

exports.customLoggerAlert = async function customLoggerAlert(
  message,
  metadata,
  errsoleId,
  originalTimestamp,
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      metadata,
      errsoleId,
    );
    if (isDuplicateAlert) {
      return false;
    }

    await SlackService.sendAlert(
      message,
      ALERT_TYPE,
      metadata,
      errsoleId,
      todayCount,
      originalTimestamp,
    );
    await EmailService.sendAlert(
      message,
      ALERT_TYPE,
      metadata,
      errsoleId,
      todayCount,
      originalTimestamp,
    );
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
  originalTimestamp,
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      metadata,
      errsoleId,
    );
    if (isDuplicateAlert) {
      return false;
    }

    await SlackService.sendAlert(
      message,
      UNCAUGHT_EXCEPTION_TYPE,
      metadata,
      errsoleId,
      todayCount,
      originalTimestamp,
    );
    await EmailService.sendAlert(
      message,
      UNCAUGHT_EXCEPTION_TYPE,
      metadata,
      errsoleId,
      todayCount,
      originalTimestamp,
    );
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};

exports.testSlackAlert = async function testSlackAlert(message, metadata) {
  try {
    return await SlackService.sendAlert(message, TEST_TYPE, metadata);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};

exports.testEmailAlert = async function testEmailAlert(message, metadata) {
  try {
    return await EmailService.sendAlert(message, TEST_TYPE, metadata);
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
