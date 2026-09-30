'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_storageConnection = __commonJS({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(exports, module) {
    'use strict';
    var storageConnection = null;
    function setStorageConnection(connection) {
      if (!storageConnection) {
        storageConnection = connection;
      }
      return storageConnection;
    }
    function getStorageConnection() {
      if (!storageConnection) throw new Error('Storage connection is not set');
      return storageConnection;
    }
    const api = {};
    api.setStorageConnection = setStorageConnection;
    api.getStorageConnection = getStorageConnection;
    module.exports = api;
  }
});

var { getStorageConnection } = require_storageConnection();
var axios = require('axios');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

exports.sendAlert = async function (alert, level, metadata, timestamp) {
  try {
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(alert, level, metadata);
    if (isDuplicateAlert) {
      return false;
    }
    return await SlackService.sendAlert(alert, 'slack', level, metadata, todayCount, timestamp),
      await EmailService.sendAlert(alert, 'email', level, metadata, todayCount, timestamp),
      true;
  } catch (err) {
    return console.error('Error sending alert:', err), false;
  }
};

exports.sendSlackAlert = async function (alert, level) {
  try {
    const result = await SlackService.sendAlert(alert, 'slack', level);
    return result;
  } catch (err) {
    return console.error('Error sending Slack alert:', err), false;
  }
};

exports.sendEmailAlert = async function (alert, level) {
  try {
    const result = await EmailService.sendAlert(alert, 'email', level);
    return result;
  } catch (err) {
    return console.error('Error sending email alert:', err), false;
  }
};

var SlackService = {};

SlackService.sendAlert = async function (alert, channel, level, metadata, todayCount, timestamp) {
  try {
    const storage = getStorageConnection();
    const slackConfig = await storage.getConfig('slack');
    if (slackConfig && slackConfig.config) {
      const config = JSON.parse(slackConfig.config.value);
      if (!config.webhookUrl) return false;
      const rateLimitConfig = await storage.getConfig('slack_rate_limit');
      let nextAllowedTime;
      if (rateLimitConfig && rateLimitConfig.config && todayCount) {
        const rateLimit = JSON.parse(rateLimitConfig.config.value);
        let nextTime;
        if (!timestamp) {
          nextTime = new Date(new Date().getTime() - 60000).toISOString();
        } else {
          nextTime = roundUpToNextSecond(timestamp);
          nextTime = nextTime.toISOString();
        }
        nextAllowedTime = rateLimit.count + ':' + todayCount + ':' + nextTime;
      }
      const webhookUrl = config.webhookUrl;
      const payload = blockKit(alert, channel, level, nextAllowedTime, todayCount);
      payload.channel = config.channel || '#general';
      payload.username = config.username || 'Errsole';
      const request = axios.post(webhookUrl, payload);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Slack request timed out'));
        }, 5000);
      });
      try {
        await Promise.race([request, timeout]);
      } catch (err) {
        return false;
      }
      return true;
    }
    return false;
  } catch (err) {
    return console.error('Error sending Slack alert:', err), false;
  }
};

function blockKit(alert, level, metadata = {}, nextAllowedTime, todayCount) {
  const blocks = { blocks: [] };
  blocks.blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '🚨 ' + level + ' *'
    }
  });
  if (metadata.message) {
    const bold = { bold: true };
    const messageSection = {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Message*',
          style: bold
        },
        {
          type: 'mrkdwn',
          text: metadata.message
        }
      ]
    };
    blocks.blocks.push(messageSection);
  }
  if (metadata.stackTrace) {
    const bold = { bold: true };
    const stackSection = {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Stack Trace*',
          style: bold
        },
        {
          type: 'mrkdwn',
          text: metadata.stackTrace
        }
      ]
    };
    blocks.blocks.push(stackSection);
  }
  if (metadata.hostname) {
    const bold = { bold: true };
    const hostSection = {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Hostname*',
          style: bold
        },
        {
          type: 'mrkdwn',
          text: metadata.hostname
        }
      ]
    };
    blocks.blocks.push(hostSection);
  }
  const alertSection = {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: alert
      }
    ]
  };
  blocks.blocks.push(alertSection);
  if (todayCount) {
    if (level === 'error') {
      blocks.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '⚠️ *' + todayCount + '* error(s) today'
        }
      });
    } else {
      blocks.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'ℹ️ *' + todayCount + '* alert(s) today'
        }
      });
    }
  }
  if (nextAllowedTime) {
    blocks.blocks.push({
      type: 'context',
      text: {
        type: 'mrkdwn',
        text: '<' + nextAllowedTime + '>'
      }
    });
  }
  if (level === 'error') {
    const divider = { type: 'divider' };
    blocks.blocks.push(divider);
  } else if (level === 'warning') {
    const divider = { type: 'divider' };
    blocks.blocks.push(divider);
  }
  const end = {};
  end.type = 'divider';
  blocks.blocks.push(end);
  return blocks;
}

var EmailService = { transporter: null };

EmailService.initialize = async function () {
  try {
    if (this.transporter === null) {
      const storage = getStorageConnection();
      const emailConfig = await storage.getConfig('email');
      if (emailConfig && emailConfig.config) {
        const config = JSON.parse(emailConfig.config.value);
        this.transporter = nodemailer.createTransport({
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 10,
          host: config.host,
          port: parseInt(config.port),
          secure: parseInt(config.secure) === 465,
          auth: {
            user: config.user,
            pass: config.pass
          }
        });
      }
    }
  } catch (err) {
    console.error('Error initializing email service:', err);
    this.transporter = null;
  }
};

EmailService.sendAlert = async function (alert, channel, level, metadata, todayCount, timestamp) {
  try {
    await EmailService.initialize();
    if (this.transporter === null) {
      return false;
    }
    const storage = getStorageConnection();
    const emailConfig = await storage.getConfig('email');
    if (emailConfig && emailConfig.config) {
      const config = JSON.parse(emailConfig.config.value);
      if (!config.to) {
        return false;
      }
      const rateLimitConfig = await storage.getConfig('email_rate_limit');
      let nextAllowedTime;
      if (rateLimitConfig && rateLimitConfig.config && todayCount) {
        const rateLimit = JSON.parse(rateLimitConfig.config.value);
        let nextTime;
        if (!timestamp) {
          nextTime = new Date(new Date().getTime() - 60000).toISOString();
        } else {
          nextTime = roundUpToNextSecond(timestamp);
          nextTime = nextTime.toISOString();
        }
        nextAllowedTime = rateLimit.count + ':' + todayCount + ':' + nextTime;
      }
      let subject, html = '';
      if (metadata.message && metadata.stackTrace) {
        subject = 'Error: ' + channel + ' (' + metadata.hostname + ' - ' + metadata.stackTrace + ')';
        html = '<h3>Error Details</h3><p><strong>Message:</strong> ' + metadata.message + '</p><p><strong>Stack Trace:</strong> ' + metadata.stackTrace + '</p>';
      } else if (metadata.message) {
        subject = 'Error: ' + channel + ' (' + metadata.hostname + ')';
        html = '<h3>Error Details</h3><p><strong>Message:</strong> ' + metadata.message + '</p>';
      } else if (metadata.stackTrace) {
        subject = 'Error: ' + channel + ' (' + metadata.stackTrace + ')';
        html = '<h3>Error Details</h3><p><strong>Stack Trace:</strong> ' + metadata.stackTrace + '</p>';
      } else {
        subject = 'Error: ' + channel;
      }
      if (metadata.hostname) {
        html += '<p><strong>Hostname:</strong> ' + metadata.hostname + '</p>';
      }
      alert = html + '<hr><p><strong>Alert:</strong> ' + alert + '</p>';
      if (todayCount) {
        if (channel === 'error') {
          alert = alert + '<p><strong>Today Count:</strong> ' + todayCount + ' error(s)</p>';
        } else {
          alert = alert + '<p><strong>Today Count:</strong> ' + todayCount + ' alert(s)</p>';
        }
      }
      if (nextAllowedTime) {
        alert = alert + '<p><strong>Next Allowed Time:</strong> ' + nextAllowedTime + '</p>';
      }
      if (channel === 'error') {
        alert = alert + '<div style="background-color:#f8d7da;color:#721c24;padding:10px;border-radius:5px;margin-top:20px;">';
      } else {
        alert = alert + '<div style="background-color:#d1ecf1;color:#0c5460;padding:10px;border-radius:5px;margin-top:20px;">';
      }
      const mailOptions = {
        from: config.from,
        to: config.to,
        subject: subject,
        html: alert
      };
      const sendMail = this.transporter.sendMail(mailOptions);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Email request timed out'));
        }, 10000);
      });
      try {
        await Promise.race([sendMail, timeout]);
      } catch (err) {
        return console.error(err), false;
      }
      return true;
    }
    return false;
  } catch (err) {
    return console.error('Error sending email alert:', err), false;
  }
};

exports.resetEmailService = async function () {
  EmailService.transporter = null;
  return true;
};

var checkAlertStatus = async (alert, level, metadata) => {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const parseValue = value => {
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };
  const storage = getStorageConnection();
  if (storage && storage.getAlertStatus) {
    const alertKey = parseValue(alert) + '|' + parseValue(level);
    const alertHash = crypto.createHash('sha256').update(alertKey).digest('hex');
    const alertStatus = {
      alert_id: metadata,
      alert_hash: alertHash,
      level: level.toLowerCase()
    };
    try {
      const status = await storage.getAlertStatus(alertStatus);
      if (status) {
        const lastAlert = status.lastAlertTime;
        todayCount = status.todayCount;
        if (lastAlert) {
          const now = new Date();
          const last = new Date(lastAlert.createdAt);
          if (now.getFullYear() === last.getFullYear() &&
              now.getMonth() === last.getMonth() &&
              now.getDate() === last.getDate() &&
              now.getHours() === last.getHours()) {
            isDuplicateAlert = true;
          }
        }
      }
    } catch (err) {
      return console.error('Error checking alert status:', err), false;
    }
  }
  const result = {};
  result.isDuplicateAlert = isDuplicateAlert;
  result.todayCount = todayCount;
  return result;
};

function roundUpToNextSecond(timestamp) {
  const date = new Date(timestamp);
  if (date.getMilliseconds() > 0) {
    date.setMilliseconds(date.getMilliseconds() + 1000);
    date.setMilliseconds(0);
  }
  return date;
}

exports.SlackService = SlackService;
exports.EmailService = EmailService;
