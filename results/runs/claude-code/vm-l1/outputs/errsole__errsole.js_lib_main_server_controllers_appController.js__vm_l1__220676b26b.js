'use strict';

const axios = require('axios');
const https = require('https');
const JsonApiSerializer = require('json-api-serializer');

const APP_TYPE = 'apps';
const INTERNAL_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';
const SLACK_CONFIG_KEY = 'slackIntegration';
const EMAIL_CONFIG_KEY = 'emailIntegration';
const ALERT_URL_CONFIG_KEY = 'alertUrl';

let storageConnection;
let emailTransport;

const Serializer = new JsonApiSerializer({ jsonapiObject: false });
Serializer.register('users', {});
Serializer.register('apps', {});
Serializer.register('logs', {
  topLevelMeta(data) {
    return data.filters;
  },
});

function serialize(value) {
  return Serializer.serialize(APP_TYPE, value);
}

function sendInternalError(response, error) {
  if (error) console.error(error);
  response.status(500).send({
    errors: [{
      error: INTERNAL_ERROR,
      message: error && error.message ? error.message : UNEXPECTED_ERROR,
    }],
  });
}

function extractAttributes(body) {
  return body.data.attributes;
}

function isSlackUrl(url) {
  return /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i.test(url);
}

function getStorageConnection() {
  if (storageConnection) return storageConnection;

  const candidates = [
    './lib/main/server/storageConnection',
    './storageConnection',
  ];
  for (const path of candidates) {
    try {
      const storageModule = require(path);
      storageConnection = storageModule.getStorageConnection();
      return storageConnection;
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
  }

  throw new Error('Storage connection is not configured');
}

function parseStoredItem(result) {
  if (result && result.item) result.item.value = JSON.parse(result.item.value);
  return result;
}

async function fetchLatestVersion(packageName) {
  const response = await axios({
    method: 'get',
    url: `https://registry.npmjs.org/${packageName}/latest`,
  });
  return response.status === 200 ? response.data.version : '0.0.0';
}

async function clearEmailTransport() {
  emailTransport = undefined;
}

async function testSlackAlert(message, title) {
  const storage = getStorageConnection();
  const result = await storage.getConfig(SLACK_CONFIG_KEY);
  if (!result || !result.item) return false;

  const config = JSON.parse(result.item.value);
  if (!config.status) return false;

  const payload = JSON.stringify({
    username: config.username,
    icon_url: config.icon_url,
    text: `*${title}*\n${message}`,
  });
  const url = new URL(config.url);

  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload),
      },
    }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode >= 200 && response.statusCode < 300));
    });
    request.on('error', reject);
    request.end(payload);
  });
}

async function testEmailAlert(message, subject) {
  const nodemailer = require('nodemailer');
  const storage = getStorageConnection();
  const result = await storage.getConfig(EMAIL_CONFIG_KEY);
  if (!result || !result.item) return false;

  const config = JSON.parse(result.item.value);
  if (!config.status) return false;

  if (!emailTransport) {
    emailTransport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      auth: { user: config.username, pass: config.password },
    });
  }

  await emailTransport.sendMail({
    from: config.sender,
    to: config.receivers,
    subject,
    text: message,
  });
  return true;
}

exports.checkUpdates = async (request, response) => {
  try {
    const latestVersion = await fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const storageLatestVersion = await fetchLatestVersion(storage.name);
    response.send(serialize({
      name: 'errsole',
      version: '2.18.2',
      latest_version: latestVersion,
      storage_name: storage.name,
      storage_version: storage.version,
      storage_latest_version: storageLatestVersion,
      storage_dialect: storage.dialect,
    }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getSlackDetails = async (request, response) => {
  try {
    const result = parseStoredItem(await getStorageConnection().getConfig(SLACK_CONFIG_KEY));
    if (result && result.item) delete result.item.value.url;
    response.send(serialize(result && result.item ? result.item : {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = extractAttributes(request.body);
    if (!isSlackUrl(url)) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have sent a url which is not a slack url.' }],
      });
    }

    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);
    if (existing && existing.item) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have already added a webhook url for slack.' }],
      });
    }

    const result = parseStoredItem(await storage.setConfig(SLACK_CONFIG_KEY, JSON.stringify({
      url,
      username: 'Errsole',
      icon_url: 'https://avatars.githubusercontent.com/u/84983840',
      status: true,
    })));
    if (result && result.item) return response.send(serialize(result.item));
    sendInternalError(response);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG_KEY);
    if (!existing || !existing.item) return sendInternalError(response);

    const config = JSON.parse(existing.item.value);
    config.status = JSON.parse(status);
    const result = parseStoredItem(await storage.setConfig(SLACK_CONFIG_KEY, JSON.stringify(config)));
    if (result && result.item) return response.send(serialize(result.item));
    sendInternalError(response);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteSlackDetails = async (request, response) => {
  try {
    const deleted = await getStorageConnection().deleteConfig(SLACK_CONFIG_KEY);
    if (deleted) {
      return response.send(serialize({ data: 'slack integration has been removed' }));
    }
    sendInternalError(response);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getEmailDetails = async (request, response) => {
  try {
    const result = parseStoredItem(await getStorageConnection().getConfig(EMAIL_CONFIG_KEY));
    if (result && result.item) delete result.item.value.url;
    response.send(serialize(result && result.item ? result.item : {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const { sender, host, port, username, password, receivers } = extractAttributes(request.body);
    const config = { sender, host, port, username, password, receivers, status: true };
    const result = parseStoredItem(await getStorageConnection().setConfig(
      EMAIL_CONFIG_KEY,
      JSON.stringify(config),
    ));

    if (result && result.item) {
      await clearEmailTransport();
      return response.send(serialize(result.item));
    }
    sendInternalError(response);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(EMAIL_CONFIG_KEY);
    if (!existing || !existing.item) return sendInternalError(response);

    const config = JSON.parse(existing.item.value);
    config.status = JSON.parse(status);
    const result = parseStoredItem(await storage.setConfig(EMAIL_CONFIG_KEY, JSON.stringify(config)));
    if (result && result.item) {
      await clearEmailTransport();
      return response.send(serialize(result.item));
    }
    sendInternalError(response);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = extractAttributes(request.body);
    const deleted = await getStorageConnection().deleteConfig(EMAIL_CONFIG_KEY);
    if (deleted) return response.send(serialize({ url }));
    sendInternalError(response);
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.testSlackNotification = async (request, response) => {
  try {
    const success = await testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification',
    );
    response.send(serialize({ success }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.testEmailNotification = async (request, response) => {
  try {
    const success = await testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification',
    );
    response.send(serialize({ success }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAlertUrlDetails = async (request, response) => {
  try {
    const result = parseStoredItem(await getStorageConnection().getConfig(ALERT_URL_CONFIG_KEY));
    response.send(serialize(result && result.item ? result.item : {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = extractAttributes(request.body);
    const result = parseStoredItem(await getStorageConnection().setConfig(
      ALERT_URL_CONFIG_KEY,
      JSON.stringify({ url }),
    ));
    if (result && result.item) return response.send(serialize(result.item));
    sendInternalError(response);
  } catch (error) {
    sendInternalError(response, error);
  }
};
