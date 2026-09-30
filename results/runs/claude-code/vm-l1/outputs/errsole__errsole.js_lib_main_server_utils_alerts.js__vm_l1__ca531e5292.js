'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

let storageConnection;
function initializeStorageConnection(connection) {
  storageConnection = connection;
}
function getStorageConnection() {
  return storageConnection;
}

function roundUpToNextSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds()) {
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
  }
  return date;
}

function metadataBlock(label, value) {
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
    blocks.push(metadataBlock('App Name', application.appName));
  }
  if (application.environmentName) {
    blocks.push(metadataBlock('Environment Name', application.environmentName));
  }
  if (application.serverName) {
    blocks.push(metadataBlock('Server Name', application.serverName));
  }
  blocks.push({
    type: 'rich_text',
    elements: [{
      type: 'rich_text_preformatted',
      elements: [{ type: 'text', text: message }],
    }],
  });

  const event = alertType === 'Alert' ? 'alert' : 'error';
  if (todayCount) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This ${event} has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`,
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
  blocks.push(
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_Note:_\n• _You will not receive another notification for this ${event} on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._`,
      },
    },
    { type: 'divider' },
  );
  return { blocks };
}

async function checkAlertStatus(message, application, errsoleId) {
  const connection = getStorageConnection();
  if (!connection) return { isDuplicateAlert: false, todayCount: 0 };
  const hashedMessage = crypto
    .createHash('sha256')
    .update(`${message}|${JSON.stringify(application)}`)
    .digest('hex');
  const item = { errsole_id: errsoleId, hashed_message: hashedMessage };
  if (application?.serverName) item.hostname = application.serverName;

  const result = await connection.insertNotificationItem(item);
  const previousDate = result?.previousNotificationItem
    ? new Date(result.previousNotificationItem.created_at)
    : null;
  const now = new Date();
  const isDuplicateAlert = Boolean(
    previousDate
      && previousDate.getUTCFullYear() === now.getUTCFullYear()
      && previousDate.getUTCMonth() === now.getUTCMonth()
      && previousDate.getUTCDate() === now.getUTCDate()
      && previousDate.getUTCHours() === now.getUTCHours(),
  );
  return { isDuplicateAlert, todayCount: result?.todayNotificationCount };
}

async function getLogUrl(connection, errsoleId, timestamp) {
  const record = await connection.getConfig('alertUrl');
  if (!record?.item || !errsoleId) return undefined;
  const { url } = JSON.parse(record.item.value);
  const time = timestamp ? roundUpToNextSecond(timestamp) : new Date(Date.now() + 2000);
  return `${url}#/logs?errsole_log_id=${errsoleId}&timestamp=${time.toISOString()}`;
}

const SlackService = {
  async sendAlert(message, alertType, application, errsoleId, todayCount, timestamp) {
    try {
      const connection = getStorageConnection();
      const record = await connection.getConfig('slackIntegration');
      if (!record?.item) return false;
      const config = JSON.parse(record.item.value);
      if (!config.status) return false;
      const logUrl = await getLogUrl(connection, errsoleId, timestamp);
      const payload = blockKit(
        message,
        alertType,
        application,
        logUrl,
        todayCount,
      );
      payload.username = config.username || 'Errsole';
      payload.icon_url = config.icon_url
        || 'https://avatars.githubusercontent.com/u/84983840';
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Slack send timed out')), 5000);
      });
      try {
        await Promise.race([axios.post(config.url, payload), timeout]);
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
      const record = await getStorageConnection().getConfig('emailIntegration');
      if (!record?.item) return;
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
    } catch (error) {
      console.error('Failed to create email transporter: ', error);
      this.transporter = null;
    }
  },
  async sendAlert(message, alertType, application = {}, errsoleId, todayCount, timestamp) {
    try {
      await this.emailTransport();
      if (this.transporter === null) return false;
      const connection = getStorageConnection();
      const record = await connection.getConfig('emailIntegration');
      if (!record?.item) return false;
      const config = JSON.parse(record.item.value);
      if (!config.status) return false;
      const logUrl = await getLogUrl(connection, errsoleId, timestamp);
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
      if (application.serverName) {
        details += `<p><b>Server Name:</b> ${application.serverName}</p>`;
      }

      const event = alertType === 'Alert' ? 'alert' : 'error';
      let html = `${details}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
      if (todayCount) {
        const plural = todayCount > 1 ? 's' : '';
        html += `<p>This ${event} has occurred <b>${todayCount} time${plural} today</b>.</p>`;
      }
      if (logUrl) {
        html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }
      html += '<br/><p style="margin:0px;font-size:small"><i>Note:'
        + '<ul style="margin:0px;padding:0px 5px;">'
        + `<li>You will not receive another notification for this ${event} on this server within the current hour.</li>`
        + '<li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>';

      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Email send timed out')), 5000);
      });
      const email = {
        from: config.sender,
        to: config.receivers,
        subject,
        html,
      };
      try {
        await Promise.race([this.transporter.sendMail(email), timeout]);
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

async function sendAlert(message, alertType, application, errsoleId, timestamp) {
  const status = await checkAlertStatus(message, application, errsoleId);
  if (status.isDuplicateAlert) return false;
  const args = [
    message,
    alertType,
    application,
    errsoleId,
    status.todayCount,
    timestamp,
  ];
  await SlackService.sendAlert(...args);
  await EmailService.sendAlert(...args);
  return true;
}

exports.customLoggerAlert = async (message, application, errsoleId, timestamp) => {
  try {
    return await sendAlert(message, 'Alert', application, errsoleId, timestamp);
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};
exports.handleUncaughtExceptions = async (
  message,
  application,
  errsoleId,
  timestamp,
) => {
  try {
    return await sendAlert(
      message,
      'Uncaught Exception',
      application,
      errsoleId,
      timestamp,
    );
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};
exports.testSlackAlert = async (message, application) => {
  try {
    return await SlackService.sendAlert(message, 'Test', application);
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};
exports.testEmailAlert = async (message, application) => {
  try {
    return await EmailService.sendAlert(message, 'Test', application);
  } catch (error) {
    console.error('Error in testEmailAlert:', error);
    return false;
  }
};
exports.clearEmailTransport = async () => {
  EmailService.transporter = null;
  return true;
};
exports.SlackService = SlackService;
exports.EmailService = EmailService;
