'use strict';

const Jsonapi = require('../utils/jsonapiUtil');
const NPMUpdates = require('../utils/npmUpdates');
const { getStorageConnection } = require('../storageConnection');
const packageJson = require('../../../../package.json');
const helpers = require('../utils/helpers');
const Alerts = require('../utils/alerts');

const INTERNAL_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';
const SLACK_CONFIG = 'slackIntegration';
const EMAIL_CONFIG = 'emailIntegration';
const ALERT_URL_CONFIG = 'alertUrl';

function serialize(data) {
  return Jsonapi.Serializer.serialize(Jsonapi.AppType, data);
}

function sendInternalError(response, error) {
  if (arguments.length > 1) console.error(error);
  response.status(500).send({
    errors: [{
      error: INTERNAL_ERROR,
      message: error && error.message ? error.message : UNEXPECTED_ERROR,
    }],
  });
}

exports.checkUpdates = async (request, response) => {
  try {
    const latestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const storageLatestVersion = await NPMUpdates.fetchLatestVersion(storage.name);

    response.send(serialize({
      name: packageJson.name,
      version: packageJson.version,
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
    const storage = getStorageConnection();
    const result = await storage.getConfig(SLACK_CONFIG);
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    response.send(serialize(result.item || {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    if (!await helpers.SlackUrl(url)) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have sent a url which is not a slack url.' }],
      });
    }

    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG);
    if (!existing || existing.item) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have already added a webhook url for slack.' }],
      });
    }

    const value = {
      url,
      username: 'Errsole',
      icon_url: 'https://avatars.githubusercontent.com/u/84983840',
      status: true,
    };
    const result = await storage.setConfig(SLACK_CONFIG, JSON.stringify(value));
    if (!result || !result.item) return sendInternalError(response);

    result.item.value = JSON.parse(result.item.value);
    response.send(serialize(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(SLACK_CONFIG);
    if (!existing || !existing.item) return sendInternalError(response);

    let value;
    try {
      value = JSON.parse(existing.item.value);
      value.status = JSON.parse(status);
    } catch (error) {
      sendInternalError(response, error);
    }

    existing.item.value.status = JSON.parse(status);
    const result = await storage.setConfig(SLACK_CONFIG, JSON.stringify(value));
    if (!result || !result.item) return sendInternalError(response);

    result.item.value = JSON.parse(result.item.value);
    response.send(serialize(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteSlackDetails = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const deleted = await storage.deleteConfig(SLACK_CONFIG);
    if (!deleted) return sendInternalError(response);
    response.send(serialize({ data: 'slack integration has been removed' }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getEmailDetails = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig(EMAIL_CONFIG);
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    response.send(serialize(result.item || {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const { sender, host, port, username, password, receivers } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const value = { sender, host, port, username, password, receivers, status: true };
    const result = await storage.setConfig(EMAIL_CONFIG, JSON.stringify(value));
    if (!result || !result.item) return sendInternalError(response);

    result.item.value = JSON.parse(result.item.value);
    await Alerts.clearEmailTransport();
    response.send(serialize(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig(EMAIL_CONFIG);
    if (!existing || !existing.item) return sendInternalError(response);

    let value;
    try {
      value = JSON.parse(existing.item.value);
      value.status = JSON.parse(status);
    } catch (error) {
      sendInternalError(response, error);
    }

    existing.item.value.status = JSON.parse(status);
    const result = await storage.setConfig(EMAIL_CONFIG, JSON.stringify(value));
    if (!result || !result.item) return sendInternalError(response);

    result.item.value = JSON.parse(result.item.value);
    await Alerts.clearEmailTransport();
    response.send(serialize(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const deleted = await storage.deleteConfig(EMAIL_CONFIG);
    if (!deleted) return sendInternalError(response);
    response.send(serialize({ url }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.testSlackNotification = async (request, response) => {
  try {
    const success = await Alerts.testSlackAlert(
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
    const success = await Alerts.testEmailAlert(
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
    const storage = getStorageConnection();
    const result = await storage.getConfig(ALERT_URL_CONFIG);
    if (result && result.item) result.item.value = JSON.parse(result.item.value);
    response.send(serialize(result.item || {}));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const result = await storage.setConfig(ALERT_URL_CONFIG, JSON.stringify({ url }));
    if (!result || !result.item) return sendInternalError(response);

    result.item.value = JSON.parse(result.item.value);
    response.send(serialize(result.item));
  } catch (error) {
    sendInternalError(response, error);
  }
};
