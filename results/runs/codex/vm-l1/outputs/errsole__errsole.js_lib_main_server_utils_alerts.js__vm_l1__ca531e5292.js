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

function roundUpToNextSecond(date) {
  const parsedDate = new Date(date);
  return new Date(Math.ceil(parsedDate.getTime() / 1000) * 1000);
}

function buildSlackMessage(message, alertType, _appInfo, alertUrl, todayCount) {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ` :warning: *Errsole: ${alertType}*`,
      },
    },
    {
      type: 'rich_text',
      elements: [
        {
          type: 'rich_text_preformatted',
          elements: [{ type: 'text', text: message }],
        },
      ],
    },
  ];

  if (todayCount) {
    const subject = alertType === 'Alert' ? 'alert' : 'error';
    const times = todayCount > 1 ? 'times' : 'time';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This ${subject} has occurred *${todayCount} ${times} today*.`,
      },
    });
  }

  if (alertUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${alertUrl}|Click here> to view the logs in the Errsole dashboard.`,
      },
    });
  }

  if (alertType !== 'Test') {
    const subject = alertType === 'Alert' ? 'alert' : 'error';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `_Note:_\n` +
          `• _You will not receive another notification for this ${subject} on this server within the current hour._\n` +
          '• _Errsole uses the UTC timezone in notifications._',
      },
    });
  }

  blocks.push({ type: 'divider' });
  return { blocks };
}

function buildAlertUrl(alertUrlConfig, logId, timestamp) {
  const logTimestamp = timestamp
    ? roundUpToNextSecond(timestamp).toISOString()
    : new Date(Date.now() + 2000).toISOString();
  return `${alertUrlConfig.url}#/logs?errsole_log_id=${logId}&timestamp=${logTimestamp}`;
}

const SlackService = {
  async sendAlert(message, alertType, appInfo, logId, todayCount, timestamp) {
    try {
      const connection = getStorageConnection();
      const slackConfigRecord = await connection.getConfig('slackIntegration');

      if (!slackConfigRecord || !slackConfigRecord.item) {
        return false;
      }

      const slackConfig = JSON.parse(slackConfigRecord.item.value);
      if (!slackConfig.status) {
        return false;
      }

      const alertUrlRecord = await connection.getConfig('alertUrl');
      let alertUrl;
      if (alertUrlRecord && alertUrlRecord.item && logId) {
        alertUrl = buildAlertUrl(JSON.parse(alertUrlRecord.item.value), logId, timestamp);
      }

      const payload = buildSlackMessage(message, alertType, appInfo, alertUrl, todayCount);
      payload.username = slackConfig.username || 'Errsole';
      payload.icon_url =
        slackConfig.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

      const request = axios.post(slackConfig.url, payload);
      const timeout = new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error('Slack send timed out')), 5000);
      });

      try {
        await Promise.race([request, timeout]);
      } catch (_error) {
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
        const emailConfigRecord = await connection.getConfig('emailIntegration');
        if (emailConfigRecord && emailConfigRecord.item) {
          const emailConfig = JSON.parse(emailConfigRecord.item.value);
          this.transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: emailConfig.host,
            port: parseInt(emailConfig.port),
            secure: parseInt(emailConfig.port) === 465,
            auth: {
              user: emailConfig.username,
              pass: emailConfig.password,
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, appInfo, logId, todayCount, timestamp) {
    try {
      await EmailService.emailTransport();
      if (this.transporter === null) {
        return false;
      }

      const connection = getStorageConnection();
      const emailConfigRecord = await connection.getConfig('emailIntegration');
      if (!emailConfigRecord || !emailConfigRecord.item) {
        return false;
      }

      const emailConfig = JSON.parse(emailConfigRecord.item.value);
      if (!emailConfig.status) {
        return false;
      }

      const alertUrlRecord = await connection.getConfig('alertUrl');
      let alertUrl;
      if (alertUrlRecord && alertUrlRecord.item && logId) {
        alertUrl = buildAlertUrl(JSON.parse(alertUrlRecord.item.value), logId, timestamp);
      }

      let subject;
      let appDetails = '';
      if (appInfo.appName && appInfo.environmentName) {
        subject = `Errsole: ${alertType} (${appInfo.appName} app, ${appInfo.environmentName} environment)`;
        appDetails = `<p><b>App Name:</b> ${appInfo.appName}</p>\n          <p><b>Environment Name:</b> ${appInfo.environmentName}</p>`;
      } else if (appInfo.appName) {
        subject = `Errsole: ${alertType} (${appInfo.appName} app)`;
        appDetails = `<p><b>App Name:</b> ${appInfo.appName}</p>`;
      } else if (appInfo.environmentName) {
        subject = `Errsole: ${alertType} (${appInfo.environmentName} environment)`;
        appDetails = `<p><b>Environment Name:</b> ${appInfo.environmentName}</p>`;
      } else {
        subject = `Errsole: ${alertType}`;
      }

      if (appInfo.serverName) {
        appDetails += `<p><b>Server Name:</b> ${appInfo.serverName}</p>`;
      }

      let html = `${appDetails}<pre style="border: 1px solid #ccc;
 background-color: #f9f9f9;
 padding: 10px;
">${message}</pre>`;

      if (todayCount) {
        const notificationType = alertType === 'Alert' ? 'alert' : 'error';
        const times = todayCount > 1 ? 'times' : 'time';
        html += `<p>This ${notificationType} has occurred <b>${todayCount} ${times} today</b>.</p>`;
      }

      if (alertUrl) {
        html += `<p><a href="${alertUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }

      const notificationType = alertType === 'Alert' ? 'alert' : 'error';
      html += `<br/><p style="margin:0px;
font-size:small"><i>Note:<ul style="margin:0px;
padding:0px 5px;
"><li>You will not receive another notification for this ${notificationType} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;

      const sendMail = this.transporter.sendMail({
        from: emailConfig.sender,
        to: emailConfig.receivers,
        subject,
        html,
      });
      const timeout = new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error('Email send timed out')), 5000);
      });

      try {
        await Promise.race([sendMail, timeout]);
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

async function checkAlertStatus(message, serverName, logId) {
  const connection = getStorageConnection();
  const hashedMessage = crypto
    .createHash('sha256')
    .update(`${message}|${serverName}`)
    .digest('hex');
  const result = await connection.insertNotificationItem({
    errsole_id: logId,
    hashed_message: hashedMessage,
  });

  let previousNotification;
  let todayCount = 0;
  if (result) {
    previousNotification = result.previousNotificationItem;
    todayCount = result.todayNotificationCount;
  }
  let isDuplicateAlert = false;
  if (previousNotification) {
    const previousDate = new Date(previousNotification.created_at);
    const currentDate = new Date();
    isDuplicateAlert =
      previousDate.getUTCFullYear() === currentDate.getUTCFullYear() &&
      previousDate.getUTCMonth() === currentDate.getUTCMonth() &&
      previousDate.getUTCDate() === currentDate.getUTCDate() &&
      previousDate.getUTCHours() === currentDate.getUTCHours();
  }

  return {
    isDuplicateAlert,
    todayCount,
  };
}

exports.customLoggerAlert = async function customLoggerAlert(
  message,
  appInfo,
  logId,
  timestamp,
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, appInfo, logId);
    if (isDuplicateAlert) {
      return false;
    }
    await SlackService.sendAlert(message, 'Alert', appInfo, logId, todayCount, timestamp);
    await EmailService.sendAlert(message, 'Alert', appInfo, logId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function handleUncaughtExceptions(
  message,
  appInfo,
  logId,
  timestamp,
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, appInfo, logId);
    if (isDuplicateAlert) {
      return false;
    }
    await SlackService.sendAlert(
      message,
      'Uncaught Exception',
      appInfo,
      logId,
      todayCount,
      timestamp,
    );
    await EmailService.sendAlert(
      message,
      'Uncaught Exception',
      appInfo,
      logId,
      todayCount,
      timestamp,
    );
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};

exports.testSlackAlert = async function testSlackAlert(message, appInfo) {
  try {
    return await SlackService.sendAlert(message, 'Test', appInfo);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};

exports.testEmailAlert = async function testEmailAlert(message, appInfo) {
  try {
    return await EmailService.sendAlert(message, 'Test', appInfo);
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
