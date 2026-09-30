'use strict';

const vm = (typeof globalThis !== 'undefined' ? globalThis :
  typeof window !== 'undefined' ? window :
  typeof self !== 'undefined' ? self :
  typeof global !== 'undefined' ? global : void 0);

const moduleCache = vm.__moduleCache || (vm.__moduleCache = {});

(function () {
  if (!moduleCache.module) {
    try { moduleCache.module = module; } catch (_) {}
  }
  if (!moduleCache.exports) {
    try { moduleCache.exports = exports; } catch (_) {}
  }
  if (!moduleCache.require) {
    try { moduleCache.require = require; } catch (_) {}
  }
  if (!moduleCache.__dirname) {
    try { moduleCache.__dirname = __dirname; } catch (_) {}
  }
  if (!moduleCache.__filename) {
    try { moduleCache.__filename = __filename; } catch (_) {}
  }
})();

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { getStorageConnection } = require_storageConnection();

function roundUpToNextSecond(date) {
  const next = new Date(date);
  next.setMilliseconds(0);
  next.setSeconds(next.getSeconds() + 1);
  return next;
}

function blockKit(message, level, meta, alertUrl, todayCount) {
  const blocks = [];

  if (meta && meta.appName) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*App Name:* ${meta.appName}`
      }
    });
  }

  if (meta && meta.environmentName) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Environment Name:* ${meta.environmentName}`
      }
    });
  }

  if (meta && meta.serverName) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Server Name:* ${meta.serverName}`
      }
    });
  }

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Level:* ${level}`
    }
  });

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Message:*\n\`\`\`${message}\`\`\``
    }
  });

  if (todayCount !== undefined && todayCount !== null) {
    if (level === 'Alert') {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `This alert has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`
        }
      });
    } else {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `This error has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.`
        }
      });
    }
  }

  if (alertUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${alertUrl}|Click here> to view the logs in the Errsole dashboard.`
      }
    });
  }

  if (level === 'Alert') {
    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: 'You will not receive another notification for this alert on this server within the current hour.'
      }]
    });
  } else {
    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: 'You will not receive another notification for this error on this server within the current hour.'
      }]
    });
  }

  return { blocks };
}

async function checkAlertStatus(message, level, meta) {
  const storage = getStorageConnection();
  const alertConfig = await storage.getConfig('alertIntegration');

  if (!alertConfig || !alertConfig.item) {
    return { isDuplicateAlert: false, todayCount: 0 };
  }

  const config = JSON.parse(alertConfig.item.value);
  if (!config.status) {
    return { isDuplicateAlert: false, todayCount: 0 };
  }

  const now = new Date();
  const currentHour = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours()
  ));

  const alertKey = `${level}:${message}:${meta && meta.appName || ''}:${meta && meta.environmentName || ''}:${meta && meta.serverName || ''}`;
  const alertHash = crypto.createHash('sha256').update(alertKey).digest('hex');

  const existingAlert = await storage.getConfig(`alert:${alertHash}`);
  if (existingAlert && existingAlert.item) {
    const existing = JSON.parse(existingAlert.item.value);
    const existingTime = new Date(existing.timestamp);
    if (existingTime >= currentHour) {
      return { isDuplicateAlert: true, todayCount: existing.count || 1 };
    }
  }

  const todayStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  const alerts = await storage.getConfig('alerts');
  let todayCount = 0;
  if (alerts && alerts.item) {
    const allAlerts = JSON.parse(alerts.item.value);
    for (const alert of allAlerts) {
      if (alert.hash === alertHash && new Date(alert.timestamp) >= todayStart) {
        todayCount++;
      }
    }
  }

  todayCount++;

  await storage.setConfig(`alert:${alertHash}`, JSON.stringify({
    timestamp: now.toISOString(),
    count: todayCount
  }));

  return { isDuplicateAlert: false, todayCount };
}

const SlackService = {
  async sendAlert(message, level, meta, logId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const slackConfig = await storage.getConfig('slackIntegration');

      if (!slackConfig || !slackConfig.item) {
        return false;
      }

      const config = JSON.parse(slackConfig.item.value);
      if (!config.status) {
        return false;
      }

      const alertUrlConfig = await storage.getConfig('alertUrl');
      let alertUrl;
      if (alertUrlConfig && alertUrlConfig.item && logId) {
        const urlConfig = JSON.parse(alertUrlConfig.item.value);
        let expiresAt;
        if (!timestamp) {
          expiresAt = new Date(new Date().getTime() + 2000).toISOString();
        } else {
          expiresAt = roundUpToNextSecond(timestamp).toISOString();
        }
        alertUrl = `${urlConfig.url}#/logs?errsole_log_id=${logId}&timestamp=${expiresAt}`;
      }

      const blocks = blockKit(message, level, meta, alertUrl, todayCount);
      blocks.username = config.username || 'Errsole';
      blocks.icon_url = config.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

      const request = axios.post(config.url, blocks);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Slack send timed out')), 5000);
      });

      try {
        await Promise.race([request, timeout]);
      } catch (_) {
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
        const emailConfig = await storage.getConfig('emailIntegration');

        if (emailConfig && emailConfig.item) {
          const config = JSON.parse(emailConfig.item.value);
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
              pass: config.password
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to create email transporter:', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, level, meta, logId, todayCount, timestamp) {
    try {
      await EmailService.emailTransport();

      if (this.transporter === null) {
        return false;
      }

      const storage = getStorageConnection();
      const emailConfig = await storage.getConfig('emailIntegration');

      if (!emailConfig || !emailConfig.item) {
        return false;
      }

      const config = JSON.parse(emailConfig.item.value);
      if (!config.status) {
        return false;
      }

      const alertUrlConfig = await storage.getConfig('alertUrl');
      let alertUrl;
      if (alertUrlConfig && alertUrlConfig.item && logId) {
        const urlConfig = JSON.parse(alertUrlConfig.item.value);
        let expiresAt;
        if (!timestamp) {
          expiresAt = new Date(new Date().getTime() + 2000).toISOString();
        } else {
          expiresAt = roundUpToNextSecond(timestamp).toISOString();
        }
        alertUrl = `${urlConfig.url}#/logs?errsole_log_id=${logId}&timestamp=${expiresAt}`;
      }

      let subject;
      let htmlHeader = '';

      if (meta && meta.appName && meta.environmentName) {
        subject = `Errsole: ${level} (${meta.appName} app, ${meta.environmentName} environment)`;
        htmlHeader = `<p><b>App Name:</b> ${meta.appName}</p><p><b>Environment Name:</b> ${meta.environmentName}</p>`;
      } else if (meta && meta.appName) {
        subject = `Errsole: ${level} (${meta.appName} app)`;
        htmlHeader = `<p><b>App Name:</b> ${meta.appName}</p>`;
      } else if (meta && meta.environmentName) {
        subject = `Errsole: ${level} (${meta.environmentName} environment)`;
        htmlHeader = `<p><b>Environment Name:</b> ${meta.environmentName}</p>`;
      } else {
        subject = `Errsole: ${level}`;
      }

      if (meta && meta.serverName) {
        htmlHeader += `<p><b>Server Name:</b> ${meta.serverName}</p>`;
      }

      let html = `${htmlHeader}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;

      if (todayCount !== undefined && todayCount !== null) {
        if (level === 'Alert') {
          html += `<p>This alert has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
        } else {
          html += `<p>This error has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
        }
      }

      if (alertUrl) {
        html += `<p><a href="${alertUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }

      if (level === 'Alert') {
        html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
      } else {
        html += `<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
      }

      const sendMail = this.transporter.sendMail({
        from: config.sender,
        to: config.receivers,
        subject,
        html
      });

      const timeout = new Promise((resolve, reject) => {
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
  }
};

exports.customLoggerAlert = async function (message, level, meta, logId) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, level, meta);
    if (isDuplicateAlert) return false;

    await SlackService.sendAlert(message, 'Alert', level, meta, todayCount, logId);
    await EmailService.sendAlert(message, 'Alert', level, meta, todayCount, logId);
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function (message, level, meta, logId) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, level, meta);
    if (isDuplicateAlert) return false;

    await SlackService.sendAlert(message, 'Uncaught Exception', level, meta, todayCount, logId);
    await EmailService.sendAlert(message, 'Uncaught Exception', level, meta, todayCount, logId);
    return true;
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false;
  }
};

exports.testSlackAlert = async function (message, meta) {
  try {
    const result = await SlackService.sendAlert(message, 'Test', meta);
    return result;
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false;
  }
};

exports.testEmailAlert = async function (message, meta) {
  try {
    const result = await EmailService.sendAlert(message, 'Test', meta);
    return result;
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
