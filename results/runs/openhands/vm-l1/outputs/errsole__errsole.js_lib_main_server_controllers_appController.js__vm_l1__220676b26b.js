'use strict';

const axios = require('axios');
const JSONAPISerializer = require('json-api-serializer');
const nodemailer = require('nodemailer');

const USER_TYPE = 'users';
const APP_TYPE = 'apps';
const LOG_TYPE = 'logs';
const SLACK_CONFIG_KEY = 'slackIntegration';
const EMAIL_CONFIG_KEY = 'emailIntegration';
const ALERT_URL_CONFIG_KEY = 'alertUrl';
const INTERNAL_SERVER_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred';

const Serializer = new JSONAPISerializer({ jsonapiObject: false });
Serializer.register(USER_TYPE, {});
Serializer.register(APP_TYPE, {});
Serializer.register(LOG_TYPE, {});

const Jsonapi = {
  UserType: USER_TYPE,
  AppType: APP_TYPE,
  LogType: LOG_TYPE,
  Serializer,
};

const packageJson = {
  name: 'errsole',
  version: '2.18.2',
};

let storageConnection;

function initializeStorageConnection(connection) {
  storageConnection = connection;
}

function getStorageConnection() {
  return storageConnection;
}

const storageConnectionModule = {
  initializeStorageConnection,
  getStorageConnection,
};

async function fetchLatestVersion(packageName) {
  const response = await axios({
    method: 'get',
    url: 'https://registry.npmjs.org/' + packageName + '/latest',
  });
  return response.data.version;
}

const NPMUpdates = { fetchLatestVersion };

function extractAttributes(body) {
  return body.data.attributes;
}

function SlackUrl(url) {
  return /^https?:\/\/hooks\.slack\.com\/services\/[^/?#]+\/[^/?#]+\/[^/?#]+\/?$/.test(url);
}

const helpers = { extractAttributes, SlackUrl };

function parseStoredConfig(result) {
  if (!result || !result.item) return null;
  return JSON.parse(result.item.value);
}

function createSlackPayload(message, title, settings) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' :warning: *Errsole: ' + title + '*',
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
      { type: 'divider' },
    ],
    username: settings.username,
    icon_url: settings.icon_url,
  };
}

const SlackService = {
  async sendAlert(message, title, settings) {
    try {
      await axios.post(settings.url, createSlackPayload(message, title, settings));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};

const EmailService = {
  transporter: false,

  async emailTransport() {
    if (this.transporter) return this.transporter;

    const settings = parseStoredConfig(
      await getStorageConnection().getConfig(EMAIL_CONFIG_KEY),
    );
    if (!settings || !settings.status) return false;

    this.transporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10,
      host: settings.host,
      port: settings.port,
      secure: Number(settings.port) === 465,
      auth: {
        user: settings.username,
        pass: settings.password,
      },
    });
    return this.transporter;
  },

  async sendAlert(message, title) {
    try {
      const transporter = await this.emailTransport();
      if (!transporter) return false;

      const settings = parseStoredConfig(
        await getStorageConnection().getConfig(EMAIL_CONFIG_KEY),
      );
      if (!settings || !settings.status) return false;

      await getStorageConnection().getConfig(ALERT_URL_CONFIG_KEY);
      await transporter.sendMail({
        from: settings.sender,
        to: settings.receivers,
        subject: 'Errsole: ' + title,
        html:
          '<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">' +
          message +
          '</pre><br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;">' +
          '<li>You will not receive another notification for this error on this server within the current hour.</li>' +
          '<li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>',
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};

const Alerts = {
  async testSlackAlert(message, title) {
    try {
      const settings = parseStoredConfig(
        await getStorageConnection().getConfig(SLACK_CONFIG_KEY),
      );
      if (!settings || !settings.status) return false;

      await getStorageConnection().getConfig(ALERT_URL_CONFIG_KEY);
      return SlackService.sendAlert(message, title, settings);
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async testEmailAlert(message, title) {
    return EmailService.sendAlert(message, title);
  },

  async clearEmailTransport() {
    EmailService.transporter = false;
    return true;
  },
};

function serializeApp(value) {
  return Serializer.serialize(APP_TYPE, value);
}

function sendInternalServerError(response, error) {
  console.error(error);
  response.status(500).send({
    errors: [
      {
        error: INTERNAL_SERVER_ERROR,
        message: error && error.message ? error.message : UNEXPECTED_ERROR_MESSAGE,
      },
    ],
  });
}

function sendUnexpectedError(response) {
  response.status(500).send({
    errors: [
      {
        error: INTERNAL_SERVER_ERROR,
        message: UNEXPECTED_ERROR_MESSAGE,
      },
    ],
  });
}

exports.checkUpdates = async (request, response) => {
  try {
    const latestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const latestStorageVersion = await NPMUpdates.fetchLatestVersion(storage.name);

    response.send(
      serializeApp({
        name: packageJson.name,
        version: packageJson.version,
        latest_version: latestVersion,
        storage_name: storage.name,
        storage_version: storage.version,
        storage_latest_version: latestStorageVersion,
        storage_dialect: storage.dialect,
      }),
    );
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.getSlackDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig(SLACK_CONFIG_KEY);
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    response.send(serializeApp((result && result.item) || {}));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    if (!(await helpers.SlackUrl(url))) {
      return response.status(409).send({
        errors: [
          {
            error: 'Conflict',
            message: 'You have sent a url which is not a slack url.',
          },
        ],
      });
    }

    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);
    if (!existing || existing.item) {
      return response.status(409).send({
        errors: [
          {
            error: 'Conflict',
            message: 'You have already added a webhook url for slack.',
          },
        ],
      });
    }

    const settings = {
      url,
      username: 'Errsole',
      icon_url: 'https://avatars.githubusercontent.com/u/84983840',
      status: true,
    };
    const result = await storage.setConfig(
      SLACK_CONFIG_KEY,
      JSON.stringify(settings),
    );

    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);

    if (!existing || !existing.item) return sendUnexpectedError(response);

    let settings;
    try {
      settings = JSON.parse(existing.item.value);
      settings.status = JSON.parse(status);
    } catch (error) {
      sendInternalServerError(response, error);
    }

    existing.item.value.status = JSON.parse(status);
    const result = await storage.setConfig(
      SLACK_CONFIG_KEY,
      JSON.stringify(settings),
    );

    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.deleteSlackDetails = async (request, response) => {
  try {
    const removed = await getStorageConnection().deleteConfig(SLACK_CONFIG_KEY);
    if (!removed) return sendUnexpectedError(response);

    response.send(
      serializeApp({ data: 'slack integration has been removed' }),
    );
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.getEmailDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig(EMAIL_CONFIG_KEY);
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    response.send(serializeApp((result && result.item) || {}));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const { sender, host, port, username, password, receivers } =
      helpers.extractAttributes(request.body);
    const settings = {
      sender,
      host,
      port,
      username,
      password,
      receivers,
      status: true,
    };
    const result = await getStorageConnection().setConfig(
      EMAIL_CONFIG_KEY,
      JSON.stringify(settings),
    );

    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    await Alerts.clearEmailTransport();
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(EMAIL_CONFIG_KEY);

    if (!existing || !existing.item) return sendUnexpectedError(response);

    let settings;
    try {
      settings = JSON.parse(existing.item.value);
      settings.status = JSON.parse(status);
    } catch (error) {
      sendInternalServerError(response, error);
    }

    existing.item.value.status = JSON.parse(status);
    const result = await storage.setConfig(
      EMAIL_CONFIG_KEY,
      JSON.stringify(settings),
    );

    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    await Alerts.clearEmailTransport();
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const removed = await getStorageConnection().deleteConfig(EMAIL_CONFIG_KEY);
    if (!removed) return sendUnexpectedError(response);

    response.send(serializeApp({ url }));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.testSlackNotification = async (request, response) => {
  try {
    const success = await Alerts.testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification',
    );
    response.send(serializeApp({ success }));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.testEmailNotification = async (request, response) => {
  try {
    const success = await Alerts.testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification',
    );
    response.send(serializeApp({ success }));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.getAlertUrlDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig(ALERT_URL_CONFIG_KEY);
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
    }
    response.send(serializeApp((result && result.item) || {}));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const result = await getStorageConnection().setConfig(
      ALERT_URL_CONFIG_KEY,
      JSON.stringify({ url }),
    );

    if (!result || !result.item) return sendUnexpectedError(response);
    result.item.value = JSON.parse(result.item.value);
    response.send(serializeApp(result.item));
  } catch (error) {
    sendInternalServerError(response, error);
  }
};

// The original bundle exposes its storage initializer globally so the host can
// supply the active adapter before invoking these handlers.
globalThis.require_storageConnection = () => storageConnectionModule;
