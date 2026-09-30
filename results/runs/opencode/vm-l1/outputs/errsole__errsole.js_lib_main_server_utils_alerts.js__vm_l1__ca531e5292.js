'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { getStorageConnection } = require('./storageConnection');

const SEND_TIMEOUT_MS = 5000;
const DEFAULT_SLACK_ICON =
  'https://avatars.githubusercontent.com/u/84983840';

function roundUpToNextSecond(date) {
  const rounded = new Date(date);
  if (rounded.getMilliseconds() !== 0) {
    rounded.setSeconds(rounded.getSeconds() + 1);
    rounded.setMilliseconds(0);
  }
  return rounded;
}

function dashboardLogUrl(config, logId, timestamp) {
  if (!config || !config.item || !logId) return undefined;

  const { url } = JSON.parse(config.item.value);
  const logTime = timestamp
    ? roundUpToNextSecond(timestamp)
    : new Date(Date.now() + 2000);

  return `${url}#/logs?errsole_log_id=${logId}&timestamp=${logTime.toISOString()}`;
}

function richTextField(label, value) {
  return {
    type: 'rich_text',
    elements: [{
      type: 'rich_text_section',
      elements: [
        { type: 'text', text: `${label}: `, style: { bold: true } },
        { type: 'text', text: value },
      ],
    }],
  };
}

function blockKit(message, alertType, application = {}, logUrl, todayCount) {
  const blocks = [{
    type: 'section',
    text: { type: 'mrkdwn', text: ` :warning: *Errsole: ${alertType}*` },
  }];

  if (application.appName) {
    blocks.push(richTextField('App Name', application.appName));
  }
  if (application.environmentName) {
    blocks.push(richTextField('Environment Name', application.environmentName));
  }
  if (application.serverName) {
    blocks.push(richTextField('Server Name', application.serverName));
  }

  blocks.push({
    type: 'rich_text',
    elements: [{
      type: 'rich_text_preformatted',
      elements: [{ type: 'text', text: message }],
    }],
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

function sendTimeout(message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), SEND_TIMEOUT_MS);
  });
}

const SlackService = {
  async sendAlert(message, alertType, application, logId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const configRecord = await storage.getConfig('slackIntegration');
      if (!configRecord || !configRecord.item) return false;

      const config = JSON.parse(configRecord.item.value);
      if (!config.status) return false;

      const alertUrl = await storage.getConfig('alertUrl');
      const logUrl = dashboardLogUrl(alertUrl, logId, timestamp);
      const payload = blockKit(
        message,
        alertType,
        application,
        logUrl,
        todayCount,
      );
      payload.username = config.username || 'Errsole';
      payload.icon_url = config.icon_url || DEFAULT_SLACK_ICON;

      try {
        await Promise.race([
          axios.post(config.url, payload),
          sendTimeout('Slack send timed out'),
        ]);
      } catch (error) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send slack alert:', error);
      return false;
    }
  },
};

function emailSubject(alertType, application) {
  if (application.appName && application.environmentName) {
    return `Errsole: ${alertType} (${application.appName} app, ${application.environmentName} environment)`;
  }
  if (application.appName) {
    return `Errsole: ${alertType} (${application.appName} app)`;
  }
  if (application.environmentName) {
    return `Errsole: ${alertType} (${application.environmentName} environment)`;
  }
  return `Errsole: ${alertType}`;
}

function emailApplicationDetails(application) {
  let details = '';
  if (application.appName) {
    details += `<p><b>App Name:</b> ${application.appName}</p>`;
  }
  if (application.environmentName) {
    details += `<p><b>Environment Name:</b> ${application.environmentName}</p>`;
  }
  if (application.serverName) {
    details += `<p><b>Server Name:</b> ${application.serverName}</p>`;
  }
  return details;
}

function emailBody(message, alertType, application, logUrl, todayCount) {
  let html = `${emailApplicationDetails(application)}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;

  if (todayCount) {
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    html += `<p>This ${noun} has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
  }
  if (logUrl) {
    html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
  }
  if (alertType !== 'Test') {
    const noun = alertType === 'Alert' ? 'alert' : 'error';
    html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this ${noun} on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
  }
  return html;
}

const EmailService = {
  transporter: null,

  async emailTransport() {
    try {
      if (this.transporter !== null) return;

      const storage = getStorageConnection();
      const configRecord = await storage.getConfig('emailIntegration');
      if (!configRecord || !configRecord.item) return;

      const config = JSON.parse(configRecord.item.value);
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

  async sendAlert(message, alertType, application, logId, todayCount, timestamp) {
    try {
      await EmailService.emailTransport();
      if (this.transporter === null) return false;

      const storage = getStorageConnection();
      const configRecord = await storage.getConfig('emailIntegration');
      if (!configRecord || !configRecord.item) return false;

      const config = JSON.parse(configRecord.item.value);
      if (!config.status) return false;

      const alertUrl = await storage.getConfig('alertUrl');
      const logUrl = dashboardLogUrl(alertUrl, logId, timestamp);
      const mail = this.transporter.sendMail({
        from: config.sender,
        to: config.receivers,
        subject: emailSubject(alertType, application),
        html: emailBody(message, alertType, application, logUrl, todayCount),
      });

      try {
        await Promise.race([mail, sendTimeout('Email send timed out')]);
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

function isInCurrentUtcHour(value) {
  const date = new Date(value);
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear()
    && date.getUTCMonth() === now.getUTCMonth()
    && date.getUTCDate() === now.getUTCDate()
    && date.getUTCHours() === now.getUTCHours();
}

async function checkAlertStatus(message, application, errsoleId) {
  try {
    const hashedMessage = crypto
      .createHash('sha256')
      .update(`${message}|${JSON.stringify(application)}`)
      .digest('hex');
    const result = await getStorageConnection().insertNotificationItem({
      errsole_id: errsoleId,
      hashed_message: hashedMessage,
      hostname: application.serverName,
    });

    return {
      isDuplicateAlert: Boolean(
        result
        && result.previousNotificationItem
        && isInCurrentUtcHour(result.previousNotificationItem.created_at),
      ),
      todayCount: result ? result.todayNotificationCount : 0,
    };
  } catch (error) {
    console.error('Error inserting notification item:', error);
    return false;
  }
}

async function customLoggerAlert(message, application, errsoleId, timestamp) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      application,
      errsoleId,
    );
    if (isDuplicateAlert) return false;

    await SlackService.sendAlert(message, 'Alert', application, errsoleId, todayCount, timestamp);
    await EmailService.sendAlert(message, 'Alert', application, errsoleId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
}

async function handleUncaughtExceptions(message, application, errsoleId, timestamp) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      message,
      application,
      errsoleId,
    );
    if (isDuplicateAlert) return false;

    await SlackService.sendAlert(message, 'Uncaught Exception', application, errsoleId, todayCount, timestamp);
    await EmailService.sendAlert(message, 'Uncaught Exception', application, errsoleId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
}

async function testSlackAlert(message, application) {
  try {
    return await SlackService.sendAlert(message, 'Test', application);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
}

async function testEmailAlert(message, application) {
  try {
    return await EmailService.sendAlert(message, 'Test', application);
  } catch (error) {
    console.error('Error in testEmailAlert:', error);
    return false;
  }
}

async function clearEmailTransport() {
  EmailService.transporter = null;
  return true;
}

exports.customLoggerAlert = customLoggerAlert;
exports.handleUncaughtExceptions = handleUncaughtExceptions;
exports.testSlackAlert = testSlackAlert;
exports.testEmailAlert = testEmailAlert;
exports.clearEmailTransport = clearEmailTransport;
exports.SlackService = SlackService;
exports.EmailService = EmailService;
