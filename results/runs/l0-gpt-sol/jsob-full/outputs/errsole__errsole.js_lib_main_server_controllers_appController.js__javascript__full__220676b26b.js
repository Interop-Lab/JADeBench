const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const request = require('request-promise');
const JsonapiSerializer = require('jsonapi-serializer').Serializer;

let storageConnection = null;
let installationId = null;

function setStorageConnection(connection) {
  if (!storageConnection) {
    storageConnection = connection;
  }
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized');
  }
  return storageConnection;
}

function serialize(type, data) {
  return new JsonapiSerializer(type, {
    attributes: Object.keys(data || {})
  }).serialize(data || {});
}

function sendError(response, error, statusCode = 500) {
  console.error(error);
  response.status(statusCode).json({
    errors: [
      {
        title: 'Error',
        detail: error && error.message ? error.message : String(error)
      }
    ]
  });
}

function extractBody(requestObject) {
  return requestObject && requestObject.body ? requestObject.body : {};
}

function validateSlackWebhook(url) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(
    url
  );
}

function convertDate(value) {
  const date = new Date(value);
  if (date.getHours() === 24) {
    date.setHours(date.getHours() - 24);
    date.setMinutes(0);
  }
  return date;
}

async function getInstallationId() {
  if (installationId) {
    return installationId;
  }

  const storage = getStorageConnection();
  const existing = await storage.getConfig('installationId');

  if (existing && existing.data && existing.data.value) {
    installationId = existing.data.value;
  } else {
    const id = uuidv4();
    const created = await storage.setConfig('installationId', id);
    if (created && created.data && created.data.value) {
      installationId = created.data.value;
    }
  }

  return installationId || false;
}

function currentInstallationId() {
  return installationId || false;
}

async function fetchLatestNpmVersion(packageName) {
  const response = await request({
    method: 'GET',
    url: `https://registry.npmjs.org/${packageName}/latest`,
    json: true
  });

  if (response && response.version) {
    return response.version;
  }

  throw new Error('Unable to retrieve the latest npm package version');
}

async function isDuplicateAlert(category, payload, alertType) {
  const storage = getStorageConnection();

  if (
    !storage ||
    typeof storage.getAlertByFingerprint !== 'function'
  ) {
    return {
      isDuplicateAlert: false,
      todayCount: 0
    };
  }

  const normalize = value => {
    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const fingerprint = crypto
    .createHash('sha256')
    .update(`${normalize(category)}|${normalize(payload)}`)
    .digest('hex');

  const result = await storage.getAlertByFingerprint({
    alertType,
    fingerprint,
    name: payload && payload.name
  });

  let duplicate = false;
  let todayCount = 0;

  if (result) {
    todayCount = result.todayCount || 0;

    if (result.lastAlert) {
      const now = new Date();
      const lastAlert = new Date(result.lastAlert.createdAt);

      duplicate =
        now.getFullYear() === lastAlert.getFullYear() &&
        now.getMonth() === lastAlert.getMonth() &&
        now.getDate() === lastAlert.getDate() &&
        now.getHours() === lastAlert.getHours();
    }
  }

  return {
    isDuplicateAlert: duplicate,
    todayCount
  };
}

function buildSlackPayload(message, alertType, details = {}, link, count) {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${alertType}*`
      }
    }
  ];

  if (details.project) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Project:*'
        },
        {
          type: 'mrkdwn',
          text: details.project
        }
      ]
    });
  }

  if (details.environment) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Environment:*'
        },
        {
          type: 'mrkdwn',
          text: details.environment
        }
      ]
    });
  }

  if (details.name) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Name:*'
        },
        {
          type: 'mrkdwn',
          text: details.name
        }
      ]
    });
  }

  blocks.push({
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: message
      }
    ]
  });

  if (count) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `This alert occurred *${count} time${count === 1 ? '' : 's'}*.`
      }
    });
  }

  if (link) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${link}|View details>`
      }
    });
  }

  blocks.push({
    type: 'divider'
  });

  return { blocks };
}

const SlackAlerts = {
  async sendAlert(message, alertType, details, link, count, date) {
    try {
      const storage = getStorageConnection();
      const slackConfigResult = await storage.getConfig('slackSettings');

      if (!slackConfigResult || !slackConfigResult.data) {
        return false;
      }

      const config = JSON.parse(slackConfigResult.data.value);

      if (!config.enabled) {
        return false;
      }

      const payload = buildSlackPayload(
        message,
        alertType,
        details,
        link,
        count,
        date
      );

      await Promise.race([
        request({
          method: 'POST',
          uri: config.url,
          body: payload,
          json: true
        }),
        new Promise((resolve, reject) => {
          setTimeout(
            () => reject(new Error('Slack request timed out')),
            10000
          );
        })
      ]);

      return true;
    } catch {
      return false;
    }
  },

  async test(url, message) {
    try {
      return await request({
        method: 'POST',
        uri: url,
        body: buildSlackPayload(message, 'Test alert'),
        json: true
      });
    } catch (error) {
      console.error('Unable to send Slack test alert', error);
      return false;
    }
  }
};

const EmailAlerts = {
  transporter: null,

  async initialize() {
    try {
      if (this.transporter !== null) {
        return;
      }

      const storage = getStorageConnection();
      const result = await storage.getConfig('emailSettings');

      if (!result || !result.data) {
        return;
      }

      const config = JSON.parse(result.data.value);

      this.transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10,
        host: config.host,
        port: parseInt(config.port, 10),
        secure: parseInt(config.port, 10) === 465,
        auth: {
          user: config.username,
          pass: config.password
        }
      });
    } catch (error) {
      console.error('Unable to initialize email alerts', error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, details, link, count, date) {
    try {
      await this.initialize();

      if (!this.transporter) {
        return false;
      }

      const storage = getStorageConnection();
      const result = await storage.getConfig('emailSettings');

      if (!result || !result.data) {
        return false;
      }

      const config = JSON.parse(result.data.value);

      if (!config.enabled) {
        return false;
      }

      let subject = alertType;
      let html = message;

      if (details && details.name) {
        subject = `${alertType}: ${details.name}`;
      }

      if (details && details.project) {
        html = `<p><strong>Project:</strong> ${details.project}</p>${html}`;
      }

      if (details && details.environment) {
        html = `<p><strong>Environment:</strong> ${details.environment}</p>${html}`;
      }

      if (count) {
        html += `<p>This alert occurred ${count} time${count === 1 ? '' : 's'}.</p>`;
      }

      if (date) {
        html += `<p>First occurrence: ${convertDate(date).toISOString()}</p>`;
      }

      if (link) {
        html += `<p>${link}View details</a></p>`;
      }

      await Promise.race([
        this.transporter.sendMail({
          from: config.sender,
          to: config.receivers,
          subject,
          html
        }),
        new Promise((resolve, reject) => {
          setTimeout(
            () => reject(new Error('Email request timed out')),
            10000
          );
        })
      ]);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async test(config) {
    try {
      const transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10,
        host: config.host,
        port: parseInt(config.port, 10),
        secure: parseInt(config.port, 10) === 465,
        auth: {
          user: config.username,
          pass: config.password
        }
      });

      return await transporter.sendMail({
        from: config.sender,
        to: config.receivers,
        subject: 'Errsole email configuration test',
        html: '<p>Your Errsole email configuration is working.</p>'
      });
    } catch (error) {
      console.error('Unable to send test email', error);
      return false;
    }
  },

  reset() {
    this.transporter = null;
    return true;
  }
};

const Alerts = {
  async sendErrorAlert(category, payload, source, link) {
    try {
      const duplicate = await isDuplicateAlert(category, payload, source);

      if (duplicate.isDuplicateAlert) {
        return false;
      }

      await SlackAlerts.sendAlert(
        category,
        'Error alert',
        payload,
        source,
        duplicate.todayCount,
        link
      );

      await EmailAlerts.sendAlert(
        category,
        'Error alert',
        payload,
        source,
        duplicate.todayCount,
        link
      );

      return true;
    } catch (error) {
      console.error('Unable to send error alert', error);
      return false;
    }
  },

  async sendWarningAlert(category, payload, source, link) {
    try {
      const duplicate = await isDuplicateAlert(category, payload, source);

      if (duplicate.isDuplicateAlert) {
        return false;
      }

      await SlackAlerts.sendAlert(
        category,
        'Warning alert',
        payload,
        source,
        duplicate.todayCount,
        link
      );

      await EmailAlerts.sendAlert(
        category,
        'Warning alert',
        payload,
        source,
        duplicate.todayCount,
        link
      );

      return true;
    } catch (error) {
      console.error('Unable to send warning alert', error);
      return false;
    }
  },

  async testSlack(url, message) {
    return SlackAlerts.test(url, message);
  },

  async testEmail(config) {
    return EmailAlerts.test(config);
  },

  resetEmailTransporter() {
    return EmailAlerts.reset();
  },

  SlackAlerts,
  EmailAlerts
};

exports.getSystemInfo = async (requestObject, response) => {
  try {
    const storage = getStorageConnection();
    const packageJson = require('../package.json');

    const latestVersion = await fetchLatestNpmVersion('errsole');
    const storageVersion = await fetchLatestNpmVersion(storage.type);

    response.json(
      serialize('system-info', {
        name: packageJson.name,
        version: packageJson.version,
        latestVersion,
        storageType: storage.type,
        storageName: storage.name,
        latestStorageVersion: storageVersion,
        storageVersion: storage.version
      })
    );
  } catch (error) {
    sendError(response, error);
  }
};

exports.getStorageSettings = async (requestObject, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('storageSettings');

    if (result && result.data) {
      result.data.value = JSON.parse(result.data.value);
      delete result.data.value.password;
    }

    response.json(
      serialize('storage-settings', result && result.data ? result.data : {})
    );
  } catch (error) {
    sendError(response, error);
  }
};

exports.saveStorageSettings = async (requestObject, response) => {
  try {
    const body = extractBody(requestObject);
    const url = body.url;
    const storage = getStorageConnection();

    const existing = await storage.getConfig('storageSettings');

    if (existing && !existing.data) {
      const settings = {
        url,
        status: 'connected',
        type: 'external',
        enabled: true
      };

      const saved = await storage.setConfig(
        'storageSettings',
        JSON.stringify(settings)
      );

      if (saved && saved.data) {
        saved.data.value = JSON.parse(saved.data.value);
        response.json(serialize('storage-settings', saved.data));
        return;
      }
    }

    response.status(400).json({
      errors: [
        {
          title: 'Storage configuration error',
          detail: 'Unable to save storage settings'
        }
      ]
    });
  } catch (error) {
    sendError(response, error);
  }
};

exports.updateStorageStatus = async (requestObject, response) => {
  try {
    const body = extractBody(requestObject);
    const storage = getStorageConnection();
    const current = await storage.getConfig('storageSettings');

    if (!current || !current.data) {
      response.status(404).json({
        errors: [
          {
            title: 'Not found',
            detail: 'Storage settings were not found'
          }
        ]
      });
      return;
    }

    const settings = JSON.parse(current.data.value);
    settings.status = body.status;

    const updated = await storage.setConfig(
      'storageSettings',
      JSON.stringify(settings)
    );

    if (updated && updated.data) {
      updated.data.value = JSON.parse(updated.data.value);
      response.json(serialize('storage-settings', updated.data));
      return;
    }

    response.status(400).json({
      errors: [
        {
          title: 'Storage configuration error',
          detail: 'Unable to update storage settings'
        }
      ]
    });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getStorageConnectionInfo = async (requestObject, response) => {
  try {
    const storage = getStorageConnection();
    const connected =
      typeof storage.checkConnection === 'function'
        ? await storage.checkConnection()
        : Boolean(storage);

    response.json(
      serialize('storage-connection', {
        connected
      })
    );
  } catch (error) {
    sendError(response, error);
  }
};

exports.getEmailSettings = async (requestObject, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('emailSettings');

    if (result && result.data) {
      result.data.value = JSON.parse(result.data.value);
      delete result.data.value.password;
    }

    response.json(
      serialize('email-settings', result && result.data ? result.data : {})
    );
  } catch (error) {
    sendError(response, error);
  }
};

exports.saveEmailSettings = async (requestObject, response) => {
  try {
    const body = extractBody(requestObject);
    const storage = getStorageConnection();

    const settings = {
      sender: body.sender,
      host: body.host,
      port: body.port,
      username: body.username,
      password: body.password,
      receivers: body.receivers,
      enabled: true
    };

    const saved = await storage.setConfig(
      'emailSettings',
      JSON.stringify(settings)
    );

    if (saved && saved.data) {
      saved.data.value = JSON.parse(saved.data.value);
      await Alerts.resetEmailTransporter();
      response.json(serialize('email-settings', saved.data));
      return;
    }

    response.status(400).json({
      errors: [
        {
          title: 'Email configuration error',
          detail: 'Unable to save email settings'
        }
      ]
    });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getSlackSettings = async (requestObject, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('slackSettings');

    if (result && result.data) {
      result.data.value = JSON.parse(result.data.value);
    }

    response.json(
      serialize('slack-settings', result && result.data ? result.data : {})
    );
  } catch (error) {
    sendError(response, error);
  }
};

exports.saveSlackSettings = async (requestObject, response) => {
  try {
    const body = extractBody(requestObject);
    const url = body.url;

    if (!validateSlackWebhook(url)) {
      response.status(400).json({
        errors: [
          {
            title: 'Invalid Slack webhook',
            detail: 'The supplied Slack webhook URL is invalid'
          }
        ]
      });
      return;
    }

    const storage = getStorageConnection();
    const saved = await storage.setConfig(
      'slackSettings',
      JSON.stringify({
        url,
        enabled: true
      })
    );

    if (saved && saved.data) {
      saved.data.value = JSON.parse(saved.data.value);
      response.json(serialize('slack-settings', saved.data));
      return;
    }

    response.status(400).json({
      errors: [
        {
          title: 'Slack configuration error',
          detail: 'Unable to save Slack settings'
        }
      ]
    });
  } catch (error) {
    sendError(response, error);
  }
};

exports.testEmailSettings = async (requestObject, response) => {
  try {
    const result = await Alerts.testEmail(extractBody(requestObject));

    response.json(
      serialize('email-test', {
        success: Boolean(result)
      })
    );
  } catch (error) {
    sendError(response, error);
  }
};

exports.testSlackSettings = async (requestObject, response) => {
  try {
    const body = extractBody(requestObject);
    const result = await Alerts.testSlack(
      body.url,
      body.message || 'Errsole Slack configuration test'
    );

    response.json(
      serialize('slack-test', {
        success: Boolean(result)
      })
    );
  } catch (error) {
    sendError(response, error);
  }
};

exports.setStorageConnection = setStorageConnection;
exports.getStorageConnection = getStorageConnection;
exports.getInstallationId = getInstallationId;
exports.currentInstallationId = currentInstallationId;
exports.validateSlackWebhook = validateSlackWebhook;
exports.Alerts = Alerts;
