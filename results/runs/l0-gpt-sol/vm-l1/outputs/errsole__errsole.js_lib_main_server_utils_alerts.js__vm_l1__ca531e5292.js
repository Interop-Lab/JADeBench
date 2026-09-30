'use strict';

const { getStorageConnection } = require('./storageConnection');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const alertHistory = new Map();

function roundUpToNextSecond(value) {
  const date = new Date(value);
  return new Date(Math.floor(date.getTime() / 1000) * 1000 + 1000);
}

async function checkAlertStatus(message, application, logId) {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const serverName = application && application.serverName
    ? application.serverName
    : '';

  const hash = crypto
    .createHash('sha256')
    .update(String(message))
    .update('\0')
    .update(String(serverName))
    .digest('hex');

  const dayKey = `${hash}:${day}`;
  const hourKey = `${hash}:${hour}`;
  const current = alertHistory.get(dayKey) || {
    count: 0,
    lastHour: null,
    lastLogId: null
  };

  current.count += 1;

  const isDuplicateAlert =
    current.lastHour === hourKey &&
    (logId == null || current.lastLogId !== logId);

  current.lastHour = hourKey;
  current.lastLogId = logId;
  alertHistory.set(dayKey, current);

  return {
    isDuplicateAlert,
    todayCount: current.count
  };
}

function blockKit(message, alertType, application, logUrl, todayCount) {
  application = application || {};

  const fields = [];

  if (application.appName) {
    fields.push({
      type: 'mrkdwn',
      text: `*App Name:*\n${application.appName}`
    });
  }

  if (application.environmentName) {
    fields.push({
      type: 'mrkdwn',
      text: `*Environment Name:*\n${application.environmentName}`
    });
  }

  if (application.serverName) {
    fields.push({
      type: 'mrkdwn',
      text: `*Server Name:*\n${application.serverName}`
    });
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Errsole: ${alertType}`,
        emoji: true
      }
    }
  ];

  if (fields.length) {
    blocks.push({
      type: 'section',
      fields
    });
  }

  blocks.push(
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `\`\`\`${String(message)}\`\`\``
      }
    }
  );

  if (todayCount) {
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `This ${noun} has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`
      }]
    });
  }

  if (logUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${logUrl}|Click here> to view the logs in the Errsole dashboard.`
      }
    });
  }

  return { blocks };
}

const SlackService = {
  async sendAlert(message, alertType, application, logId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const integration = await storage.getConfig('slackIntegration');

      if (!integration || !integration.item) {
        return false;
      }

      const settings = JSON.parse(integration.item.value);

      if (!settings.status) {
        return false;
      }

      const alertUrlConfig = await storage.getConfig('alertUrl');
      let logUrl;

      if (alertUrlConfig && alertUrlConfig.item && logId) {
        const alertUrl = JSON.parse(alertUrlConfig.item.value);
        let linkTimestamp;

        if (timestamp) {
          linkTimestamp = roundUpToNextSecond(timestamp).toISOString();
        } else {
          linkTimestamp = new Date(Date.now() + 2000).toISOString();
        }

        logUrl =
          alertUrl.url +
          '#/logs?errsole_log_id=' +
          logId +
          '&timestamp=' +
          linkTimestamp;
      }

      const payload = blockKit(
        message,
        alertType,
        application,
        logUrl,
        todayCount
      );

      payload.username = settings.username || 'Errsole';
      payload.icon_url =
        settings.icon_url ||
        'https://avatars.githubusercontent.com/u/84983840';

      const request = axios.post(settings.url, payload);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Slack send timed out'));
        }, 5000);
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
  }
};

const EmailService = {
  transporter: null,

  async emailTransport() {
    try {
      if (this.transporter === null) {
        const storage = getStorageConnection();
        const integration = await storage.getConfig('emailIntegration');

        if (integration && integration.item) {
          const settings = JSON.parse(integration.item.value);
          const port = parseInt(settings.port);

          this.transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: settings.host,
            port,
            secure: port === 465,
            auth: {
              user: settings.username,
              pass: settings.password
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, application, logId, todayCount, timestamp) {
    try {
      await EmailService.emailTransport();

      if (this.transporter === null) {
        return false;
      }

      const storage = getStorageConnection();
      const integration = await storage.getConfig('emailIntegration');

      if (!integration || !integration.item) {
        return false;
      }

      const settings = JSON.parse(integration.item.value);

      if (!settings.status) {
        return false;
      }

      const alertUrlConfig = await storage.getConfig('alertUrl');
      let logUrl;

      if (alertUrlConfig && alertUrlConfig.item && logId) {
        const alertUrl = JSON.parse(alertUrlConfig.item.value);
        let linkTimestamp;

        if (timestamp) {
          linkTimestamp = roundUpToNextSecond(timestamp).toISOString();
        } else {
          linkTimestamp = new Date(Date.now() + 2000).toISOString();
        }

        logUrl =
          alertUrl.url +
          '#/logs?errsole_log_id=' +
          logId +
          '&timestamp=' +
          linkTimestamp;
      }

      application = application || {};

      let subject;
      let details = '';

      if (application.appName && application.environmentName) {
        subject =
          `Errsole: ${alertType} (` +
          `${application.appName} app, ` +
          `${application.environmentName} environment)`;

        details =
          `<p><b>App Name:</b> ${application.appName}</p>` +
          `<p><b>Environment Name:</b> ${application.environmentName}</p>`;
      } else if (application.appName) {
        subject = `Errsole: ${alertType} (${application.appName} app)`;
        details = `<p><b>App Name:</b> ${application.appName}</p>`;
      } else if (application.environmentName) {
        subject =
          `Errsole: ${alertType} (` +
          `${application.environmentName} environment)`;

        details =
          `<p><b>Environment Name:</b> ${application.environmentName}</p>`;
      } else {
        subject = `Errsole: ${alertType}`;
      }

      if (application.serverName) {
        details += `<p><b>Server Name:</b> ${application.serverName}</p>`;
      }

      let html =
        `${details}` +
        '<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">' +
        `${message}` +
        '</pre>';

      if (todayCount) {
        if (alertType === 'Alert') {
          html +=
            `<p>This alert has occurred <b>${todayCount} time` +
            `${todayCount > 1 ? 's' : ''} today</b>.</p>`;
        } else {
          html +=
            `<p>This error has occurred <b>${todayCount} time` +
            `${todayCount > 1 ? 's' : ''} today</b>.</p>`;
        }
      }

      if (logUrl) {
        html +=
          `<p><a href="${logUrl}">Click here</a> ` +
          'to view the logs in the Errsole dashboard.</p>';
      }

      if (alertType === 'Alert') {
        html +=
          '<br/><p style="margin:0px;font-size:small"><i>Note:' +
          '<ul style="margin:0px;padding:0px 5px;">' +
          '<li>You will not receive another notification for this alert on this server within the current hour.</li>' +
          '<li>Errsole uses the UTC timezone in notifications.</li>' +
          '</ul></i></p>';
      } else {
        html +=
          '<br/><p style="margin:0px;font-size:small"><i>Note:' +
          '<ul style="margin:0px;padding:0px 5px;">' +
          '<li>You will not receive another notification for this error on this server within the current hour.</li>' +
          '<li>Errsole uses the UTC timezone in notifications.</li>' +
          '</ul></i></p>';
      }

      const request = this.transporter.sendMail({
        from: settings.sender,
        to: settings.receivers,
        subject,
        html
      });

      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Email send timed out'));
        }, 5000);
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
  }
};

exports.customLoggerAlert = async function (
  message,
  application,
  logId,
  timestamp
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      application,
      logId
    );

    if (isDuplicateAlert) {
      return false;
    }

    await SlackService.sendAlert(
      message,
      'Alert',
      application,
      logId,
      todayCount,
      timestamp
    );

    await EmailService.sendAlert(
      message,
      'Alert',
      application,
      logId,
      todayCount,
      timestamp
    );

    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function (
  message,
  application,
  logId,
  timestamp
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      application,
      logId
    );

    if (isDuplicateAlert) {
      return false;
    }

    await SlackService.sendAlert(
      message,
      'Uncaught Exception',
      application,
      logId,
      todayCount,
      timestamp
    );

    await EmailService.sendAlert(
      message,
      'Uncaught Exception',
      application,
      logId,
      todayCount,
      timestamp
    );

    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};

exports.testSlackAlert = async function (message, application) {
  try {
    return await SlackService.sendAlert(message, 'Test', application);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};

exports.testEmailAlert = async function (message, application) {
  try {
    return await EmailService.sendAlert(message, 'Test', application);
  } catch (error) {
    console.error('Error in testEmailAlert:', error);
    return false;
  }
};

exports.clearEmailTransport = async function () {
  EmailService.transporter = null;
  return true;
};

exports.SlackService = SlackService;
exports.EmailService = EmailService;
