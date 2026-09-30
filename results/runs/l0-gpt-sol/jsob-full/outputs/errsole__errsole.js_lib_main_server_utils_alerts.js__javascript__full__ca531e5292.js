'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { getStorageConnection } = require('../work/errsole__errsole.js/lib/main/server/storageConnection.js');

let emailTransporter = null;

function parseValue(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeValue(value) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function roundUpToNextSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds() > 0) {
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
  }
  return date;
}

function blockKit(title, severity, details = {}, timestamp, count) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: title
      }
    }
  ];

  if (details.error) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Error*'
        },
        {
          type: 'mrkdwn',
          text: details.error
        }
      ]
    });
  }

  if (details.warning) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Warning*'
        },
        {
          type: 'mrkdwn',
          text: details.warning
        }
      ]
    });
  }

  if (details.time) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Time*'
        },
        {
          type: 'mrkdwn',
          text: details.time
        }
      ]
    });
  }

  blocks.push({
    type: 'divider'
  });

  if (severity) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: String(severity)
      }
    });
  }

  if (count !== undefined && count !== null) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `This alert has occurred ${count} time${count === 1 ? '' : 's'} today.`
        }
      ]
    });
  }

  if (timestamp) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `<${timestamp}>`
        }
      ]
    });
  }

  return {
    blocks,
    text: title
  };
}

async function loadSetting(connection, names) {
  for (const name of names) {
    try {
      const value = await connection.get(name);
      if (value) return parseValue(value);
    } catch {
      // Continue with the next supported setting name.
    }
  }
  return null;
}

const SlackService = {
  async send(title, severity, details, count, timestamp, occurrenceTime) {
    try {
      const storage = getStorageConnection();
      const settings = await loadSetting(storage, [
        'slackSettings',
        'slackConfig',
        'slack'
      ]);

      if (!settings || !settings.enabled) return false;

      const webhook = await loadSetting(storage, [
        'slackWebhook',
        'slackWebHook',
        'slackWebhookUrl',
        'slack_url'
      ]);

      if (!webhook) return false;

      let alertTimestamp = occurrenceTime;
      if (!alertTimestamp) {
        alertTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      } else {
        alertTimestamp = roundUpToNextSecond(alertTimestamp).toISOString();
      }

      const payload = blockKit(
        title,
        severity,
        details,
        alertTimestamp,
        count
      );

      if (settings.username) payload.username = settings.username;
      if (settings.iconEmoji) payload.icon_emoji = settings.iconEmoji;

      const request = axios.post(webhook, payload);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Slack request timed out')), 5000);
      });

      await Promise.race([request, timeout]);
      return true;
    } catch (error) {
      console.error('Error sending Slack alert:', error);
      return false;
    }
  }
};

const EmailService = {
  transporter: null,

  async initialize() {
    try {
      if (this.transporter !== null) return;

      const storage = getStorageConnection();
      const settings = await loadSetting(storage, [
        'emailSettings',
        'emailConfig',
        'smtpSettings',
        'smtp'
      ]);

      if (!settings || !settings.enabled) return;

      this.transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10,
        host: settings.host,
        port: parseInt(settings.port, 10),
        secure: parseInt(settings.secure, 10) === 465,
        auth: {
          user: settings.user,
          pass: settings.pass
        }
      });
    } catch (error) {
      console.error('Error initializing email service:', error);
      this.transporter = null;
    }
  },

  async send(title, severity, details, count, timestamp, occurrenceTime) {
    try {
      await this.initialize();
      if (!this.transporter) return false;

      let subject;
      let body = '';

      if (details && details.error && details.stack) {
        subject = `Error: ${title} (${details.error})`;
        body = `<h2>Error</h2><p>${details.error}</p><pre>${details.stack}</pre>`;
      } else if (details && details.error) {
        subject = `Error: ${title} (${details.error})`;
        body = `<h2>Error</h2><p>${details.error}</p>`;
      } else if (details && details.warning) {
        subject = `Warning: ${title} (${details.warning})`;
        body = `<h2>Warning</h2><p>${details.warning}</p>`;
      } else {
        subject = `Alert: ${title}`;
        body = `<h2>${title}</h2>`;
      }

      if (details && details.time) {
        body += `<p><strong>Time:</strong> ${details.time}</p>`;
      }

      if (occurrenceTime) {
        body += `<p><strong>Occurrence time:</strong> ${occurrenceTime}</p>`;
      }

      if (count !== undefined && count !== null) {
        body += `<p>This alert has occurred ${count} time${count === 1 ? '' : 's'} today.</p>`;
      }

      if (timestamp) {
        body += `<p>${timestamp}</p>`;
      }

      const storage = getStorageConnection();
      const settings = await loadSetting(storage, [
        'emailSettings',
        'emailConfig',
        'smtpSettings',
        'smtp'
      ]);

      if (!settings || !settings.to) return false;

      const mail = {
        from: settings.from || settings.user,
        to: settings.to,
        subject,
        html: body
      };

      const request = this.transporter.sendMail(mail);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Email request timed out')), 5000);
      });

      await Promise.race([request, timeout]);
      return true;
    } catch (error) {
      console.error('Error sending email alert:', error);
      return false;
    }
  }
};

async function checkAlertStatus(application, alert, timestamp) {
  let duplicate = false;
  let todayCount = 0;

  try {
    const storage = getStorageConnection();
    if (!storage) return { isDuplicateAlert: false, todayCount: 0 };

    const applicationKey = normalizeValue(application);
    const alertKey = normalizeValue(alert);
    const digestInput = `${applicationKey}|${alertKey}`;

    const hash = crypto
      .createHash('sha256')
      .update(digestInput)
      .digest('hex');

    const record = {
      alertId: hash,
      applicationId: applicationKey,
      alertTime: timestamp && timestamp.time
    };

    const existing = await storage.findOne(record);

    if (existing) {
      duplicate = true;
      todayCount = existing.todayCount || existing.count || 0;
    } else {
      const created = await storage.create(record);
      if (created) {
        todayCount = created.todayCount || created.count || 1;
      }
    }
  } catch (error) {
    console.error('Error checking alert status:', error);
  }

  return {
    isDuplicateAlert: duplicate,
    todayCount
  };
}

async function sendAlert(application, title, severity, details, occurrenceTime) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      application,
      title,
      details
    );

    if (isDuplicateAlert) return false;

    await SlackService.send(
      application,
      severity,
      title,
      details,
      todayCount,
      occurrenceTime
    );

    await EmailService.send(
      application,
      severity,
      title,
      details,
      todayCount,
      occurrenceTime
    );

    return true;
  } catch (error) {
    console.error('Error sending alert:', error);
    return false;
  }
}

async function sendAlertWithoutDuplicateCheck(
  application,
  title,
  severity,
  occurrenceTime
) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(
      application,
      title,
      severity
    );

    if (isDuplicateAlert) return false;

    await SlackService.send(
      application,
      title,
      severity,
      occurrenceTime,
      todayCount
    );

    await EmailService.send(
      application,
      title,
      severity,
      occurrenceTime,
      todayCount
    );

    return true;
  } catch (error) {
    console.error('Error sending alert:', error);
    return false;
  }
}

async function sendSlackAlert(application, message) {
  try {
    return await SlackService.send(application, message);
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return false;
  }
}

async function sendEmailAlert(application, message) {
  try {
    return await EmailService.send(application, message);
  } catch (error) {
    console.error('Error sending email alert:', error);
    return false;
  }
}

async function resetEmailService() {
  EmailService.transporter = null;
  emailTransporter = null;
  return true;
}

exports.sendAlert = sendAlert;
exports.sendAlertWithoutDuplicateCheck = sendAlertWithoutDuplicateCheck;
exports.sendSlackAlert = sendSlackAlert;
exports.sendEmailAlert = sendEmailAlert;
exports.resetEmailService = resetEmailService;
exports.SlackService = SlackService;
exports.EmailService = EmailService;
